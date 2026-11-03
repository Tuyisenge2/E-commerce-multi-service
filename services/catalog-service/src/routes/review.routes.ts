import { asyncHandler } from "../requestErrors";
import express from "express";
import {
	createReview,
	deleteReviews,
	getAllReview,
	updateReviews,
} from "../controllers/review.controller";
import authentication from "../middlewares/auth";
import productMiddlewares from "../middlewares/product.middlewares";
import {
	ReviewOwner,
	isOrderDelivered,
	isReviewAvailable,
	isSalesDelivered,
	reviewValidate,
} from "../middlewares/review.middleware";

const reviewRouter = express.Router();
reviewRouter.get("/", asyncHandler(getAllReview));
reviewRouter.post(
	"/",
	asyncHandler(authentication.isBuyer),
	asyncHandler(productMiddlewares.IdValidated("productId", "ProductId")),
	asyncHandler(productMiddlewares.isProductAvailable("productId")),
	asyncHandler(isOrderDelivered),
	asyncHandler(isSalesDelivered),
	asyncHandler(reviewValidate),
	asyncHandler(createReview),
);
reviewRouter.patch(
	"/:id",
	asyncHandler(authentication.isBuyer),
	asyncHandler(productMiddlewares.IdValidated("id", "reviewId")),
	asyncHandler(isReviewAvailable("id")),
	asyncHandler(ReviewOwner),
	asyncHandler(reviewValidate),
	asyncHandler(updateReviews),
);

reviewRouter.delete(
	"/:id",
	asyncHandler(authentication.isBuyer),
	asyncHandler(productMiddlewares.IdValidated("id", "reviewId")),
	asyncHandler(isReviewAvailable("id")),
	asyncHandler(ReviewOwner),
	asyncHandler(deleteReviews),
);
export default reviewRouter;
