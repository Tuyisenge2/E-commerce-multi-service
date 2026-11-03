import { asyncHandler } from "../requestErrors";
import {
	createRole,
	assignRole,
	updateRole,
	allRole,
} from "../controllers/roleController";
import express from "express";
import {
	roleNameValid,
	roleIdValidations,
} from "../middlewares/role.middleware";
import authentication from "../middlewares/auth";
export const roleRoutes = express.Router();

roleRoutes.get(
	"/roles/",
	asyncHandler(authentication.isAdmin),
	asyncHandler(allRole),
);
roleRoutes.post(
	"/roles/",
	asyncHandler(authentication.isAdmin),
	asyncHandler(roleNameValid),
	asyncHandler(createRole),
);
roleRoutes.post(
	"/users/:userId/roles",
	asyncHandler(authentication.isAdmin),
	asyncHandler(roleIdValidations),
	asyncHandler(assignRole),
);
roleRoutes.patch(
	"/roles/:id",
	asyncHandler(authentication.isAdmin),
	asyncHandler(roleNameValid),
	asyncHandler(updateRole),
);
