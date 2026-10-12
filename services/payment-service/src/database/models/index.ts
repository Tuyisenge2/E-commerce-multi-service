import { Sequelize } from "sequelize";
import paymentModel from "./payments";

const Models = (sequelize: Sequelize) => ({ Payments: paymentModel(sequelize) });

export default Models;
