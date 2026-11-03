import { asyncHandler } from "../requestErrors";
import express from "express";
import userController from "../controllers/userController";
import userMiddleware from "../middlewares/user.middleware";
import otpIsValid from "../middlewares/otp";
import { resetPasswort, forgotPassword } from "../controllers/resetPasswort";
import authentication from "../middlewares/auth";

const userRoutes = express.Router();
userRoutes.post(
	"/register",
	asyncHandler(userMiddleware.userValid),
	asyncHandler(userController.registerUser),
);

userRoutes.post(
	"/login",
	asyncHandler(userMiddleware.logInValidated),
	asyncHandler(userMiddleware.checkAccountStatus),
	asyncHandler(userController.login),
);

userRoutes.post(
	"/forgot-password",
	asyncHandler(userMiddleware.resetValidated),
	asyncHandler(forgotPassword),
);
userRoutes.post(
	"/reset-password/:token",
	asyncHandler(userMiddleware.isPassword),
	asyncHandler(resetPasswort),
);
userRoutes.patch(
	"/password-update",
	asyncHandler(authentication.is_authenticated_when_password_expired),
	asyncHandler(userMiddleware.isUpdatePassValid),
	asyncHandler(userController.updatePassword),
);
userRoutes.get(
	"/",
	asyncHandler(authentication.isAdmin),
	asyncHandler(userController.allUsers),
);
userRoutes.patch(
	"/:userId/account-status",
	asyncHandler(authentication.isAdmin),
	asyncHandler(userMiddleware.accountStatusValid),
	asyncHandler(userController.accountStatus),
);
userRoutes.get(
	"/account/verify/:token",
	asyncHandler(userController.accountVerify),
);
userRoutes.post(
	"/logout",
	asyncHandler(authentication.authenticateUser),
	asyncHandler(userController.logout),
);
userRoutes.get(
	"/account/verify/:token",
	asyncHandler(userController.accountVerify),
);

userRoutes.post(
	"/2fa/:token",
	asyncHandler(otpIsValid),
	asyncHandler(userController.two_factor_authentication),
);
userRoutes.get("/auth/google", asyncHandler(userController.googleAuthInit));

userRoutes.get(
	"/auth/google/callback",
	asyncHandler(userController.handleGoogleAuth),
);

export default userRoutes;
