import axios from "axios";

const client = axios.create({
	baseURL: process.env.USER_SERVICE_URL ?? "http://user-service:3001",
});

export const getUserById = async (userId: string, token: string) => {
	const response = await client.get(`/internal/users/${userId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};
