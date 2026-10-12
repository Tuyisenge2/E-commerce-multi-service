import express from "express";
import { connectionToDatabase } from "./database/config/db.config";
import databaseModels from "./database/config/db.config";
import auth, { ExpandedRequest } from "./middlewares/auth";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());
app.get("/health", (_request, response) =>
	response.json({ service: "notification-service", status: "ok" }),
);
app.get("/api/v1/notifications", auth.authenticateUser, async (request: ExpandedRequest, response) =>
	response.json(await databaseModels.Notification.findAll({ where: { userId: request.user?.id } })),
);
app.patch("/api/v1/notifications/:id/read", auth.authenticateUser, async (request: ExpandedRequest, response) => {
	const notification = await databaseModels.Notification.findOne({
		where: { id: request.params.id, userId: request.user?.id },
	});
	if (!notification) return response.status(404).json({ message: "Notification not found" });
	await notification.update({ unread: false });
	return response.json(notification);
});
app.get("/api/v1/chats", auth.authenticateUser, async (_request, response) =>
	response.json(await databaseModels.message.findAll({ order: [["createdAt", "ASC"]] })),
);
app.post("/api/v1/chats", auth.authenticateUser, async (request: ExpandedRequest, response) =>
	response.status(201).json(await databaseModels.message.create({
		id: randomUUID(),
		senderId: request.user?.id as string,
		message: request.body.message,
	})),
);
app.post("/internal/notifications", async (request, response) =>
	response.status(201).json(await databaseModels.Notification.create(request.body)),
);

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3006);
		app.listen(port, () =>
			console.log(`notification-service listening on ${port}`),
		);
	})
	.catch((error) => {
		console.error("Unable to connect to notification database", error);
		process.exit(1);
	});
