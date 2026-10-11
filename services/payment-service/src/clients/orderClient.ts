import axios from "axios";

const client = axios.create({
	baseURL: process.env.ORDER_SERVICE_URL ?? "http://order-service:3004",
});

export const createOrder = async (payload: unknown, token: string) => {
	const response = await client.post("/internal/orders/checkout", payload, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};
