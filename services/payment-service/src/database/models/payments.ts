import { DataTypes, Model, Sequelize, UUIDV4 } from "sequelize";
import {
	PaymentsModelAttributes,
	paymentsCreationAttributes,
} from "../../types/model";

export class Payments extends Model<
	PaymentsModelAttributes,
	paymentsCreationAttributes
> {
	public id!: string;
	public payerId!: string;
	public paymentMethod!: string;
	public paymentId!: string;
	public sessionId!: string;
	public orderId!: string;
	public status!: string;
	public phoneNumber!: string;

}

const paymemt_model = (sequelize: Sequelize) => {
	Payments.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			payerId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			paymentMethod: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			paymentId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			sessionId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			orderId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "SUCCESSFUL",
			},
			phoneNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "payments",
		},
	);
	return Payments;
};

export default paymemt_model;
