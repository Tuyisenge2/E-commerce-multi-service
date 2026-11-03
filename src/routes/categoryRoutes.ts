import { asyncHandler } from "../requestErrors";
import express from "express";
import userAuthentication from "../middlewares/auth";
import categoryController from "../controllers/categoryController";

const categoryRouter = express.Router();

categoryRouter.post(
	"/",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(categoryController.add_category),
);
categoryRouter.get("/", asyncHandler(categoryController.read_all_categories));
categoryRouter.get(
	"/:id",
	asyncHandler(categoryController.read_single_category),
);
categoryRouter.patch(
	"/:id",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(categoryController.update_category),
);

export default categoryRouter;
