import { asyncHandler } from "../requestErrors";
import express from "express";
import paymentController from "../controllers/paymentController";
import userAuthentication from "../middlewares/auth";
import paymentMiddlewares from "../middlewares/payments.middlewares";

const paymentRouter = express.Router();

paymentRouter.post(
	"/",
	asyncHandler(userAuthentication.isBuyer),
	asyncHandler(paymentMiddlewares.paymentMethods(["stripe", "momo"])),
	asyncHandler(paymentMiddlewares.userHasCart),
	asyncHandler(paymentMiddlewares.cartHasProducts),
	asyncHandler(paymentMiddlewares.TAMOUNT_NOTBELOW(600)),
	asyncHandler(paymentMiddlewares.validMomo),
	asyncHandler(paymentMiddlewares.requestToPay),
	asyncHandler(paymentController.create_checkout_session),
);
paymentRouter.get("/success", asyncHandler(paymentController.checkout_success));
paymentRouter.post("/cancel", asyncHandler(paymentController.checkout_cancel));

export default paymentRouter;
