import { asyncHandler } from "../requestErrors";
import express from "express";
import userAuthentication from "../middlewares/auth";
import { chat, chatLogin, read_all_messages } from "../controllers/chat";

const chatRoutes = express.Router();
chatRoutes.get("/", asyncHandler(chat));
chatRoutes.get("/login", asyncHandler(chatLogin));
chatRoutes.get(
	"/messages",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(read_all_messages),
);

export default chatRoutes;
