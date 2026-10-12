import { Model, Sequelize, DataTypes, UUIDV4 } from "sequelize";
import {
	salesModelAttributes,
	salesCreationAttributes,
} from "../../types/model";
import { Order } from "./order";
export class Sales extends Model<
	salesModelAttributes,
	salesCreationAttributes
> {
	declare id: string;
	declare orderId: string;
	declare buyerId: string;
	declare productId: string;
	declare status: string;
	declare deliveryDate: Date;
	declare quantitySold: number;

	public static associate(models: { Order: typeof Order }) {
		this.belongsTo(models.Order, {
			foreignKey: "orderId",
			as: "order",
		});
	}
}
const sales_model = (sequelize: Sequelize) => {
	Sales.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			orderId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "orders",
					key: "id",
				},
			},
			buyerId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			productId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM("pending", "canceled", "delivered"),
				defaultValue: "pending",
				allowNull: false,
			},
			deliveryDate: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			quantitySold: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "sales",
		},
	);
	return Sales;
};
export default sales_model;
