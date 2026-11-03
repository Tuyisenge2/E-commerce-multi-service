import { asyncHandler } from "../requestErrors";
import express from "express";
import {
	read_allQuerries,
	read_oneQuerry,
	createQuerry,
} from "../controllers/querriesController";
import isQuerryValidated from "../middlewares/querryMiddleware";
import authentication from "../middlewares/auth";

const querryRouter = express.Router();

querryRouter.post(
	"/",
	asyncHandler(isQuerryValidated),
	asyncHandler(createQuerry),
);
querryRouter.get(
	"/",
	asyncHandler(authentication.isAdmin),
	asyncHandler(read_allQuerries),
);
querryRouter.get(
	"/:id",
	asyncHandler(authentication.isAdmin),
	asyncHandler(read_oneQuerry),
);

export default querryRouter;
