import { Sequelize } from "sequelize";
import categoryModel from "./category";
import productModel from "./product";
import reviewModel from "./review";
import wishlistModel from "./wishlist";

const Models = (sequelize: Sequelize) => {
	const Category = categoryModel(sequelize);
	const Product = productModel(sequelize);
	const review = reviewModel(sequelize);
	const wish = wishlistModel(sequelize);
	Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
	Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
	Product.hasMany(review, { foreignKey: "productId", as: "reviews" });
	review.belongsTo(Product, { foreignKey: "productId", as: "product" });
	Product.hasMany(wish, { foreignKey: "productId", as: "wishes" });
	wish.belongsTo(Product, { foreignKey: "productId", as: "product" });
	return { Category, Product, review, wish };
};

export default Models;
