import axios from "axios";

const client = axios.create({
	baseURL: process.env.ORDER_SERVICE_URL ?? "http://order-service:3004",
});

export const createOrder = async (payload: unknown, token?: string) => {
	const response = await client.post("/internal/orders/checkout", payload, token ? {
		headers: { Authorization: `Bearer ${token}` },
	} : undefined);
	return response.data;
};

export const getOrderById = async (orderId: string) => {
	const response = await client.get(`/internal/orders/${orderId}`);
	return response.data;
};
