import { DataTypes, Model, Sequelize } from "sequelize";
import { cartCreationAttributes, cartModelAttributes } from "../../types/model";

import { cartItem } from "../../types/cart";

class Cart extends Model<cartModelAttributes, cartCreationAttributes> {
	declare id: string;
	declare userId: string;
	declare products: cartItem[];
	declare total: number;

}
const cart_model = (sequelize: Sequelize) => {
	Cart.init(
		{
			id: {
				allowNull: false,
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
			},
			userId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			products: DataTypes.ARRAY(DataTypes.JSONB),
			total: DataTypes.FLOAT,
		},
		{
			sequelize,
			modelName: "Cart",
			tableName: "carts",
		},
	);
	return Cart;
};

export default cart_model;
