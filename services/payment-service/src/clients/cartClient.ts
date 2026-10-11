import axios from "axios";

const client = axios.create({ baseURL: process.env.CART_SERVICE_URL ?? "http://cart-service:3003" });

export const getCart = async (token: string) => {
	const response = await client.get("/api/v1/carts", { headers: { Authorization: `Bearer ${token}` } });
	return response.data?.data ?? response.data;
};

export const clearCart = async (token: string) => {
	await client.put("/api/v1/carts", {}, { headers: { Authorization: `Bearer ${token}` } });
};
