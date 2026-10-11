import axios from "axios";

const client = axios.create({
	baseURL: process.env.CATALOG_SERVICE_URL ?? "http://catalog-service:3002",
});

export const getProduct = async (productId: string, token: string) => {
	const response = await client.get(`/api/v1/products/${productId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};
