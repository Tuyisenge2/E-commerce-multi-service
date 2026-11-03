import { asyncHandler } from "../requestErrors";
import express from "express";
import orderController from "../controllers/orderController";
import authentication from "../middlewares/auth";

const orderRoutes = express.Router();

orderRoutes.get(
	"/",
	asyncHandler(authentication.authenticateUser),
	asyncHandler(authentication.isBuyer),
	asyncHandler(orderController.getOrders),
);

orderRoutes.get(
	"/:id",
	asyncHandler(authentication.authenticateUser),
	asyncHandler(authentication.isBuyer),
	asyncHandler(orderController.getSingleOrder),
);

export default orderRoutes;
