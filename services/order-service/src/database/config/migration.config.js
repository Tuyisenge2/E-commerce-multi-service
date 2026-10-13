const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../../../../.env") });

const hostedDatabase = process.env.DB_HOSTED_MODE === "hosted";

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    schema: "orders",
    dialectOptions: hostedDatabase
      ? { ssl: { require: true, rejectUnauthorized: true } }
      : {},
  },
};
