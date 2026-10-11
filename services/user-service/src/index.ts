import express from "express";
import session from "express-session";
import passport from "./middlewares/passport";
import userRoutes from "./routes/userRoutes";
import profileRouter from "./routes/profileRouter";
import { roleRoutes } from "./routes/roleRoutes";
import { connectionToDatabase } from "./database/config/db.config";
import databaseModels from "./database/config/db.config";

const app = express();
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

app.get("/health", (_request, response) =>
	response.json({ service: "user-service", status: "ok" }),
);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", profileRouter);
app.use("/api/v1", roleRoutes);
app.get("/internal/users/:id", async (request, response) => {
	const user = await databaseModels.User.findByPk(request.params.id);
	if (!user) return response.status(404).json({ message: "User not found" });
	const data = user.toJSON() as unknown as Record<string, unknown>;
	delete data.password;
	delete data.confirmPassword;
	return response.json(data);
});

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3001);
		app.listen(port, () => console.log(`user-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to user database", error);
		process.exit(1);
	});
