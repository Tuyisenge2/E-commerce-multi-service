import axios from "axios";

const client = axios.create({ baseURL: process.env.CATALOG_SERVICE_URL ?? "http://catalog-service:3002" });
export const getProduct = async (id: string, token?: string) => (await client.get(`/internal/products/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)).data;
