import axios from "axios";
import { JwtPayload } from "jsonwebtoken";

const client = axios.create({
	baseURL: process.env.USER_SERVICE_URL ?? "http://user-service:3001",
});

export const getUserById = async (userId: string, token: string) => {
	const response = await client.get(`/internal/users/${userId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};

export const validateAccessToken = async (token: string): Promise<JwtPayload> => {
	const response = await client.post(
		"/internal/auth/validate",
		{},
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	return response.data.user;
};
