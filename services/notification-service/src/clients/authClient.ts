import { JwtPayload } from "jsonwebtoken";

export const validateAccessToken = async (token: string): Promise<JwtPayload> => {
	const baseUrl = process.env.USER_SERVICE_URL ?? "http://user-service:3001";
	const response = await fetch(`${baseUrl}/internal/auth/validate`, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!response.ok) throw new Error("Invalid or expired token");
	const body = (await response.json()) as { user: JwtPayload };
	return body.user;
};
