import { Sequelize } from "sequelize";
import orderModel from "./order";
import salesModel from "./sales";

const Models = (sequelize: Sequelize) => {
	const Order = orderModel(sequelize);
	const Sales = salesModel(sequelize);
	Order.hasMany(Sales, { foreignKey: "orderId", as: "sales" });
	Sales.belongsTo(Order, { foreignKey: "orderId", as: "order" });
	return { Order, Sales };
};

export default Models;
