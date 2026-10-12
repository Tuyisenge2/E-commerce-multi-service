import { Sequelize } from "sequelize";
import cartModel from "./cart";

const Models = (sequelize: Sequelize) => ({ Cart: cartModel(sequelize) });

export default Models;
