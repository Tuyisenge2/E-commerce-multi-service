/* eslint-disable no-shadow */
import { CreateOptions, FindOptions, UpdateOptions } from "sequelize";
import database_models from "../database/config/db.config";
const models = database_models as Record<string, any>;

type ModelTypes =
	| "Product"
	| "Category"
	| "User"
	| "Blacklist"
	| "Token"
	| "resetPassword"
	| "role"
	| "message"
	| "wish"
	| "Payments"
	| "Cart"
	| "Order"
	| "Sales"
	| "review"
	| "Notification"
	| "Querries";
type MethodTypes = "findAll" | "findOne" | "destroy" | "create" | "update";

export const read_function = async <T>(
	model: ModelTypes,
	method: MethodTypes,
	condition?: FindOptions,
) => {
	if (!models[model] || !models[model][method]) {
		throw new Error(
			`Invalid ${!models[model] ? "modelName" : ""} ${!models[model] && !models[model]?.[method] ? "and" : ""} ${!models[model]?.[method] ? "method" : ""}`,
		);
	}
	const result = await (
		models[model][method] as (condition: FindOptions) => Promise<T>
	)(condition as FindOptions);
	return result;
};

export const insert_function = async <T>(
	model: ModelTypes,
	method: MethodTypes,
	data: any,
	condition?: FindOptions | UpdateOptions,
): Promise<T> => {
	if (!models[model] || !models[model][method]) {
		throw new Error(
			`Invalid ${!models[model] ? "modelName" : ""} ${!models[model] && !models[model]?.[method] ? "and" : ""} ${!models[model]?.[method] ? "method" : ""}`,
		);
	}

	if (method === "create") {
		const result = await (
			models[model][method] as (
				data: any,
				options?: CreateOptions,
			) => Promise<T>
		)(data, condition as CreateOptions);
		return result;
	} else if (method === "update") {
		if (!condition) {
			throw new Error("Condition is required for update operation");
		}
		const result = await (
			models[model][method] as (
				values: any,
				options?: UpdateOptions,
			) => Promise<T>
		)(data, condition as UpdateOptions);
		return result;
	} else {
		throw new Error("Invalid method type");
	}
};
