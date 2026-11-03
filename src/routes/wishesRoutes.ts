import { asyncHandler } from "../requestErrors";
import express from "express";
import wishesController from "../controllers/wishlistController";
import userAuthentication from "../middlewares/auth";
import wishMiddlewares from "../middlewares/wish.middlewares";
const wishesRouter = express.Router();

// create wish
wishesRouter.post(
	"/",
	asyncHandler(userAuthentication.isBuyer),
	asyncHandler(wishMiddlewares.isValidWish),
	asyncHandler(wishesController.createWishlist),
);

// get all wishes
wishesRouter.get(
	"/",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(wishesController.getWishlist),
);

// get a wish seller only
wishesRouter.get(
	"/:id",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(wishMiddlewares.userWishProduct),
	asyncHandler(wishesController.getSingleWishlist),
);

export default wishesRouter;
