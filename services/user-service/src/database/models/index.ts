import { Sequelize } from "sequelize";
import userModel from "./User";
import blacklistModel from "./blacklist";
import resetPasswordModel from "./resetPassword";
import roleModel from "./role";
import tokenModel from "./token";

const Models = (sequelize: Sequelize) => {
	const User = userModel(sequelize);
	const role = roleModel(sequelize);
	const Token = tokenModel(sequelize);
	const Blacklist = blacklistModel(sequelize);
	const resetPassword = resetPasswordModel(sequelize);
	User.belongsTo(role, { as: "Roles", foreignKey: "role" });
	role.hasMany(User, { as: "Users", foreignKey: "role" });
	return { User, role, Token, Blacklist, resetPassword };
};

export default Models;
