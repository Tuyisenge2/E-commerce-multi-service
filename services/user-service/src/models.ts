import { DataTypes, Model, Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DB_DEV_URL ?? "", {
	dialect: "postgres",
	logging: false,
});

export class Role extends Model { declare id: string; declare roleName: string; }
Role.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	roleName: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, tableName: "roles" });

export class User extends Model {
	declare id: string; declare userName: string; declare firstName: string; declare lastName: string;
	declare email: string; declare password: string; declare confirmPassword: string; declare role: string;
	declare isVerified: boolean; declare isPasswordExpired: boolean; declare isActive: boolean;
}
User.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	userName: { type: DataTypes.STRING, allowNull: false }, firstName: { type: DataTypes.STRING, allowNull: false },
	lastName: { type: DataTypes.STRING, allowNull: false }, email: { type: DataTypes.STRING, allowNull: false, unique: true },
	password: { type: DataTypes.STRING, allowNull: false }, confirmPassword: { type: DataTypes.STRING, allowNull: false },
	role: { type: DataTypes.UUID, allowNull: false }, isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
	isPasswordExpired: { type: DataTypes.BOOLEAN, defaultValue: false }, isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
	gender: DataTypes.STRING, birthDate: DataTypes.DATE, phoneNumber: DataTypes.STRING,
	preferredLanguage: DataTypes.STRING, preferredCurrency: DataTypes.STRING, profileImage: DataTypes.STRING,
	addressLine1: DataTypes.STRING, addressLine2: DataTypes.STRING, country: DataTypes.STRING,
	city: DataTypes.STRING, zipCode: DataTypes.INTEGER,
}, { sequelize, tableName: "users" });

export class Token extends Model { declare id: string; declare token: string; }
Token.init({ id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, token: { type: DataTypes.STRING(10000), allowNull: false, unique: true } }, { sequelize, tableName: "tokens" });

export class BlacklistedToken extends Model { declare id: string; declare token: string; }
BlacklistedToken.init({ id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, token: { type: DataTypes.STRING, allowNull: false } }, { sequelize, tableName: "blacklisted_tokens" });

export class ResetPasswordToken extends Model { declare id: string; declare email: string; declare resetToken: string; }
ResetPasswordToken.init({ id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, email: { type: DataTypes.STRING, allowNull: false }, resetToken: { type: DataTypes.STRING(1000), allowNull: false } }, { sequelize, tableName: "resetPassword_tokens" });

User.belongsTo(Role, { as: "Roles", foreignKey: "role" });
Role.hasMany(User, { as: "Users", foreignKey: "role" });
