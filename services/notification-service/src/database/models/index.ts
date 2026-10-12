import { Sequelize } from "sequelize";
import messageModel from "./message";
import notificationModel from "./notification";

const Models = (sequelize: Sequelize) => ({
	message: messageModel(sequelize),
	Notification: notificationModel(sequelize),
});

export default Models;
