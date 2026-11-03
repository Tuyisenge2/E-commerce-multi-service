import { asyncHandler, requestErrorHandler } from "./requestErrors";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./middlewares/passport";
import userRoutes from "./routes/userRoutes";
import profileRouter from "./routes/profileRouter";
import { roleRoutes } from "./routes/roleRoutes";
import { connectionToDatabase } from "./database/config/db.config";
import databaseModels from "./database/config/db.config";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./utils/keys";
import { corsOptions } from "./config/cors";

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "local-user-service-session",
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
	"/health",
	asyncHandler((_request, response) =>
		response.json({ service: "user-service", status: "ok" }),
	),
);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", profileRouter);
app.use("/api/v1", roleRoutes);
app.get(
	"/internal/users/:id",
	asyncHandler(async (request, response) => {
		const user = await databaseModels.User.findByPk(request.params.id);
		if (!user) return response.status(404).json({ message: "User not found" });
		const data = user.toJSON() as unknown as Record<string, unknown>;
		delete data.password;
		delete data.confirmPassword;
		return response.json(data);
	}),
);
app.post(
	"/internal/auth/validate",
	asyncHandler(async (request, response) => {
		const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
		if (!token)
			return response.status(401).json({ message: "Token is required" });
		try {
			const blacklisted = await databaseModels.Blacklist.findOne({
				where: { token },
			});
			if (blacklisted) {
				return response.status(401).json({ message: "Token has been revoked" });
			}
			const user = jwt.verify(token, ACCESS_TOKEN_SECRET as string);
			return response.json({ user });
		} catch {
			return response.status(401).json({ message: "Invalid or expired token" });
		}
	}),
);

app.use(requestErrorHandler);

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3001);
		app.listen(port, () => console.log(`user-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to user database", error);
		process.exit(1);
	});
