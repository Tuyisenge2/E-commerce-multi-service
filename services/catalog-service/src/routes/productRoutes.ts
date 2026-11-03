import { asyncHandler } from "../requestErrors";
import express from "express";
import userAuthentication from "../middlewares/auth";
import productController from "../controllers/productController";
import productMiddlewares from "../middlewares/product.middlewares";
import fileUpload from "../middlewares/multer";
import searchProduct from "../controllers/searchProduct";
import { searchMiddleware } from "../middlewares/search.middleware";
import { getReviewsOnProduct } from "../controllers/review.controller";

const productRouter = express.Router();

productRouter.get(
	"/search",
	asyncHandler(searchMiddleware),
	asyncHandler(searchProduct.search_product),
);

productRouter.post(
	"/",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(fileUpload.array("images")),
	asyncHandler(productMiddlewares.isValidProduct),
	asyncHandler(productController.create_product),
);

productRouter.get(
	"/",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(productController.read_all_products),
);
productRouter.get(
	"/guest-products",
	asyncHandler(productController.guest_read_all_products),
);

productRouter.get(
	"/guest-products/:id",
	asyncHandler(productController.guest_read_single_product),
);
productRouter.get(
	"/:id",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(productController.read_single_product),
);

productRouter.post(
	"/recommended",
	asyncHandler(userAuthentication.authenticateUser),
	asyncHandler(productController.getRecommendedProducts),
);

productRouter.patch(
	"/:id",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(fileUpload.array("images")),
	asyncHandler(productController.update_product),
);
productRouter.patch(
	"/:id/availability-status",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(productController.update_product_status),
);

productRouter.delete(
	"/:id",
	asyncHandler(userAuthentication.isSeller),
	asyncHandler(productController.delete_product),
);
productRouter.get(
	"/:id/reviews/",
	asyncHandler(productMiddlewares.IdValidated("id", "reviewId")),
	asyncHandler(productMiddlewares.isProductAvailable("id")),
	asyncHandler(getReviewsOnProduct),
);

export default productRouter;
