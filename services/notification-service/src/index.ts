import express from "express";
import http from "http";
import notificationRouter from "./routes/notificationsRoutes";
import chatRouter from "./routes/chatRoutes";
import { connectionToDatabase } from "./database/config/db.config";

const app = express();
app.use(express.json());
app.get("/health", (_request, response) => response.json({ service: "notification-service", status: "ok" }));
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/chats", chatRouter);

connectionToDatabase().then(() => {
	const server = http.createServer(app);
	const port = Number(process.env.PORT ?? 3006);
	server.listen(port, () => console.log(`notification-service listening on ${port}`));
}).catch((error) => {
	console.error("Unable to connect to notification database", error);
	process.exit(1);
});
