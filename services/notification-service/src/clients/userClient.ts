import axios from "axios";

const client = axios.create({
	baseURL: process.env.USER_SERVICE_URL ?? "http://user-service:3001",
});
export const getUser = async (id: string, token?: string) =>
	(
		await client.get(
			`/internal/users/${id}`,
			token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
		)
	).data;
