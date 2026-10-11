import axios from "axios";

const client = axios.create({ baseURL: process.env.ORDER_SERVICE_URL ?? "http://order-service:3004" });
export const getOrder = async (id: string, token?: string) => (await client.get(`/api/v1/orders/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)).data;
