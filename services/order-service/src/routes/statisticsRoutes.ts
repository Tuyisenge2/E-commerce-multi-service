import { asyncHandler } from "../requestErrors";
import express from "express";
import { sellerStatistics } from "../controllers/sellerStatisticsController";

import authenticate from "../middlewares/auth";

export const statisticsRouter = express.Router();

statisticsRouter.get(
	"/stats",
	asyncHandler(authenticate.authenticateUser),
	asyncHandler(authenticate.isSeller),

	asyncHandler(sellerStatistics),
);
