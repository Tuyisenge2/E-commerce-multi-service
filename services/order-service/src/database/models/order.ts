import { Model, Sequelize, DataTypes, UUIDV4 } from "sequelize";
import {
	OrderModelAttributes,
	OrderCreationAttributes,
} from "../../types/model";
import { Sales } from "./sales";

export class Order extends Model<
	OrderModelAttributes,
	OrderCreationAttributes
> {
	declare id: string;
	declare buyerId: string;
	declare status: string;

	public static associate(models: { Sales: typeof Sales }) {
		this.hasMany(models.Sales, {
			foreignKey: "orderId",
			as: "sales",
		});
	}
}
const order_model = (sequelize: Sequelize) => {
	Order.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				primaryKey: true,
			},
			buyerId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM("pending", "canceled", "delivered"),
				defaultValue: "pending",
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "orders",
		},
	);
	return Order;
};
export default order_model;
