import { asyncHandler } from "../requestErrors";
import express from "express";
import userAuthentication from "../middlewares/auth";
import {
	read_allNotifications,
	read_oneNotification,
	update_notification,
	mark_all_as_read,
	delete_notification,
} from "../controllers/notificationController";
import { notificationLogin, notificationPage } from "../utils/nodeEvents";
const notificationRouter = express.Router();

notificationRouter.get("/appnotifications", asyncHandler(notificationPage));
notificationRouter.get("/login", asyncHandler(notificationLogin));
notificationRouter.get(
	"/",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(read_allNotifications),
);

notificationRouter.get(
	"/:id",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(read_oneNotification),
);

notificationRouter.patch(
	"/:id",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(update_notification),
);

notificationRouter.patch(
	"/",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(mark_all_as_read),
);

notificationRouter.delete(
	"/:id",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(delete_notification),
);
export default notificationRouter;
