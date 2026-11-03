import { asyncHandler } from "../requestErrors";
import express from "express";
import salesController from "../controllers/salesController";
import authentication from "../middlewares/auth";
import orderSalesValid from "../middlewares/salesMiddleware";

const salesRoutes = express.Router();

salesRoutes.get(
	"/",
	asyncHandler(authentication.authenticateUser),
	asyncHandler(authentication.isSeller),
	asyncHandler(salesController.allSales),
);

salesRoutes.get(
	"/:id",
	asyncHandler(authentication.authenticateUser),
	asyncHandler(authentication.isSeller),
	asyncHandler(salesController.singleSale),
);

salesRoutes.patch(
	"/:id/status",
	asyncHandler(authentication.authenticateUser),
	asyncHandler(authentication.isSeller),
	asyncHandler(orderSalesValid),
	asyncHandler(salesController.updateOrderStatus),
);

export default salesRoutes;
