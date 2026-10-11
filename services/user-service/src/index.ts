import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import express, { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BlacklistedToken, ResetPasswordToken, Role, sequelize, Token, User } from "./models";
import googlePassport, { configured as googleConfigured } from "./google-auth";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use(googlePassport.initialize());

app.get("/health", (_request, response) => {
	response.json({ service: "user-service", status: "ok" });
});

type AuthRequest = Request & { user?: JwtPayload };

const secret = process.env.ACCESS_TOKEN_SECRET ?? "local-user-service-secret";
const publicUser = (user: User) => {
	const safeUser = user.toJSON() as Record<string, unknown>;
	delete safeUser.password;
	delete safeUser.confirmPassword;
	return safeUser;
};

const tokenFor = async (user: User) => {
	const role = await Role.findByPk(user.role);
	const token = jwt.sign({ id: user.id, email: user.email, role: role?.roleName ?? user.role }, secret, { expiresIn: "1d" });
	await Token.create({ token });
	return token;
};

const authenticate = (request: AuthRequest, response: Response, next: NextFunction) => {
	const token = request.headers.authorization?.replace("Bearer ", "");
	if (!token) return response.status(401).json({ message: "Please login to continue" });
	try {
		if (await BlacklistedToken.findOne({ where: { token } })) return response.status(401).json({ message: "Please login to continue" });
		request.user = jwt.verify(token, secret);
		return next();
	} catch {
		return response.status(401).json({ message: "Invalid or expired token" });
	}
};

const requireAdmin = (request: AuthRequest, response: Response, next: NextFunction) => {
	if (request.user?.role !== "ADMIN") return response.status(403).json({ message: "Admin access required" });
	return next();
};

app.post("/api/v1/users/register", async (request, response) => {
	const { email, password, firstName = "", lastName = "" } = request.body ?? {};
	if (!email || !password) return response.status(400).json({ message: "Email and password are required" });
	if (await User.findOne({ where: { email: email.toLowerCase() } })) return response.status(409).json({ message: "User already exists" });
	const role = await Role.findOne({ where: { roleName: "BUYER" } });
	if (!role) return response.status(500).json({ message: "BUYER role is missing" });
	const hashed = await bcrypt.hash(password, 10);
	const user = await User.create({ userName: email.split("@")[0], email: email.toLowerCase(), password: hashed, confirmPassword: hashed, firstName, lastName, role: role.id });
	return response.status(201).json({ message: "Account created successfully", user: publicUser(user), token: await tokenFor(user) });
});

app.post("/api/v1/users/login", async (request, response) => {
	const { email, password } = request.body ?? {};
	const user = await User.findOne({ where: { email: String(email).toLowerCase() } });
	if (!user || !user.isActive || !(await bcrypt.compare(password ?? "", user.password))) return response.status(401).json({ message: "Wrong credentials" });
	return response.json({ message: "Login successfully", user: publicUser(user), token: await tokenFor(user) });
});

app.get("/api/v1/users/account/verify/:token", async (request, response) => {
	const record = await Token.findOne({ where: { token: request.params.token } });
	if (!record) return response.status(400).json({ message: "Invalid verification link" });
	try {
		const payload = jwt.verify(record.token, secret) as JwtPayload;
		const user = await User.findByPk(payload.id);
		if (!user) return response.status(400).json({ message: "Invalid verification link" });
		await user.update({ isVerified: true });
		await record.destroy();
		return response.json({ message: "Email verified successfully" });
	} catch {
		return response.status(400).json({ message: "Invalid verification link" });
	}
});

app.post("/api/v1/users/forgot-password", async (request, response) => {
	const user = await User.findOne({ where: { email: String(request.body?.email ?? "").toLowerCase() } });
	if (user) {
		const resetToken = randomBytes(32).toString("hex");
		await ResetPasswordToken.create({ email: user.email, resetToken });
		console.log(`Password reset token for ${user.email}: ${resetToken}`);
	}
	return response.json({ message: "If the account exists, password reset instructions have been created" });
});

app.post("/api/v1/users/reset-password/:token", async (request, response) => {
	const reset = await ResetPasswordToken.findOne({ where: { resetToken: request.params.token } });
	if (!reset) return response.status(400).json({ message: "Invalid reset token" });
	const user = await User.findOne({ where: { email: reset.email } });
	if (!user || !request.body?.password) return response.status(400).json({ message: "Invalid password reset request" });
	const password = await bcrypt.hash(request.body.password, 10);
	await user.update({ password, confirmPassword: password, isPasswordExpired: false });
	await reset.destroy();
	return response.json({ message: "Password reset successfully" });
});

app.patch("/api/v1/users/password-update", authenticate, async (request: AuthRequest, response) => {
	const user = await User.findByPk(request.user?.id as string);
	if (!user || !request.body?.password) return response.status(400).json({ message: "Password is required" });
	const password = await bcrypt.hash(request.body.password, 10);
	await user.update({ password, confirmPassword: password, isPasswordExpired: false });
	return response.json({ message: "Password updated successfully" });
});

app.patch("/api/v1/users/:userId/account-status", authenticate, requireAdmin, async (request, response) => {
	const user = await User.findByPk(request.params.userId);
	if (!user) return response.status(404).json({ message: "User not found" });
	await user.update({ isActive: Boolean(request.body?.isActive) });
	return response.json({ message: "Account status updated", user: publicUser(user) });
});

app.post("/api/v1/users/2fa/:token", async (request, response) => {
	const record = await Token.findOne({ where: { token: request.params.token } });
	if (!record || !request.body?.otp) return response.status(400).json({ message: "Invalid OTP request" });
	return response.status(501).json({ message: "OTP verification requires the email delivery provider configuration" });
});

app.get("/api/v1/users/auth/google", (request, response, next) => {
	if (!googleConfigured) return response.status(503).json({ message: "Google OAuth is not configured" });
	return googlePassport.authenticate("google", { scope: ["profile", "email"] })(request, response, next);
});
app.get("/api/v1/users/auth/google/callback", (request, response, next) => {
	if (!googleConfigured) return response.status(503).json({ message: "Google OAuth is not configured" });
	return googlePassport.authenticate("google", { session: false }, async (error, user) => {
		if (error || !user) return response.status(401).json({ message: "Google authentication failed" });
		return response.json({ message: "Login successfully", token: await tokenFor(user as User), user: publicUser(user as User) });
	})(request, response, next);
});

app.post("/api/v1/users/logout", authenticate, (request, response) => {
	const token = request.headers.authorization?.replace("Bearer ", "");
	if (token) await BlacklistedToken.create({ token });
	return response.json({ message: "Logged out successfully" });
});

app.get("/api/v1/profile", authenticate, (request: AuthRequest, response) => {
	const user = await User.findByPk(request.user?.id as string);
	return user ? response.json(publicUser(user)) : response.status(404).json({ message: "User not found" });
});

app.patch("/api/v1/profile", authenticate, (request: AuthRequest, response) => {
	const user = await User.findByPk(request.user?.id as string);
	if (!user) return response.status(404).json({ message: "User not found" });
	await user.update({ firstName: request.body.firstName ?? user.firstName, lastName: request.body.lastName ?? user.lastName });
	return response.json(publicUser(user));
});

app.get("/api/v1/users", authenticate, requireAdmin, async (_request, response) => response.json((await User.findAll()).map(publicUser)));

sequelize.authenticate().then(() => app.listen(port, () => console.log(`user-service listening on ${port}`))).catch((error) => {
	console.error("Unable to connect to user database", error);
	process.exit(1);
});
