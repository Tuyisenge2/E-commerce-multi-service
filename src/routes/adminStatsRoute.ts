import { asyncHandler } from "../requestErrors";
import express from "express";

import authenticate from "../middlewares/auth";
import { adminStatistics } from "../controllers/adminStatistics";

export const AdminstatisticsRouter = express.Router();

AdminstatisticsRouter.get(
	"/admin/stats",
	asyncHandler(authenticate.authenticateUser),
	asyncHandler(authenticate.isAdmin),
	asyncHandler(adminStatistics),
);
