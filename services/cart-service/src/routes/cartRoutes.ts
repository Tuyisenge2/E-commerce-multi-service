import { asyncHandler } from "../requestErrors";
import express from "express";
import auth from "../middlewares/auth";
import {
	addItemToCart,
	viewCart,
	clearCart,
	updateCart,
} from "../controllers/cartController";
import isCartValidated from "../middlewares/cart.middlewares";
import { isProductExist } from "../middlewares/product.middlewares";

const cartRouter = express.Router();

cartRouter.post(
	"/",
	asyncHandler(auth.authenticateUser),
	asyncHandler(isCartValidated),
	asyncHandler(isProductExist),
	asyncHandler(addItemToCart),
);
cartRouter.get(
	"/",
	asyncHandler(auth.authenticateUser),
	asyncHandler(viewCart),
);
cartRouter.put(
	"/",
	asyncHandler(auth.authenticateUser),
	asyncHandler(clearCart),
);
cartRouter.patch(
	"/",
	asyncHandler(auth.authenticateUser),
	asyncHandler(isProductExist),
	asyncHandler(updateCart),
);
export default cartRouter;
