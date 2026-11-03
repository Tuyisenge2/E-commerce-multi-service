import { asyncHandler } from "../requestErrors";
import express from "express";
import userController from "../controllers/userController";
import authenticate from "../middlewares/auth";
import fileUpload from "../middlewares/multer";
import userMiddleware from "../middlewares/user.middleware";

const profileRouter = express.Router();

profileRouter.get(
	"/profile",
	asyncHandler(authenticate.authenticateUser),
	asyncHandler(userController.read_profile),
);
profileRouter.patch(
	"/profile",
	asyncHandler(authenticate.authenticateUser),
	asyncHandler(fileUpload.single("profileImage")),
	asyncHandler(userMiddleware.validateProfile),
	asyncHandler(userController.update_user_profile),
);
export default profileRouter;
