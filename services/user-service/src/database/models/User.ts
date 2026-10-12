import { DataTypes, Model, Sequelize, UUIDV4 } from "sequelize";
import { UserCreationAttributes, UserModelAttributes } from "../../types/model";

const default_date = new Date(Date.now());

export class User extends Model<UserModelAttributes, UserCreationAttributes> {
	declare id: string;
	declare userName: string;
	declare firstName: string;
	declare lastName: string;
	declare email: string;
	declare password: string;
	declare confirmPassword: string;
	declare role: string;
	declare isVerified: boolean;
	declare isPasswordExpired: boolean;
	declare lastTimePasswordUpdated: Date;
	declare isActive: boolean;
	declare gender: string;
	declare birthDate: Date;
	declare phoneNumber: string;
	declare preferredLanguage: string;
	declare preferredCurrency: string;
	declare profileImage: string;
	declare addressLine1: string;
	declare addressLine2: string;
	declare country: string;
	declare city: string;
	declare zipCode: number;

}

const user_model = (sequelize: Sequelize) => {
	User.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			userName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			confirmPassword: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			role: {
				type: DataTypes.UUID,
				defaultValue: UUIDV4,
				allowNull: false,
				references: {
					model: "roles",
					key: "id",
				},
			},
			isVerified: {
				type: DataTypes.BOOLEAN,
				defaultValue: UUIDV4,
				allowNull: false,
			},
			isPasswordExpired: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			lastTimePasswordUpdated: {
				type: DataTypes.DATE,
				defaultValue: default_date,
				allowNull: false,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			gender: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			birthDate: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			phoneNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			preferredLanguage: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			preferredCurrency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			profileImage: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			addressLine1: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			addressLine2: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			country: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			city: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			zipCode: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			tableName: "users",
		},
	);

	return User;
};
export default user_model;
