import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { validateAccessToken } from "../clients/userClient";
import {
	OrderWithUserAssociations,
	ProductWithAssociations,
	reviewsAttribute,
	salesCreationAttributes,
} from "../types/model";
import { sendResponse } from "../utils/http.exception";

export interface ExpandedRequest extends Request {
	cart?: any;
	user?: JwtPayload;
	product?: ProductWithAssociations;
	review?: reviewsAttribute;
	sales?: salesCreationAttributes;
	order?: OrderWithUserAssociations;
}
export interface ExtendedSocket extends Socket { user?: JwtPayload }

const tokenFrom = (request: Request) =>
	request.headers.authorization?.replace(/^Bearer\s+/i, "");

const authenticate = async (
	request: ExpandedRequest,
	response: Response,
	next: NextFunction,
	allowExpiredPassword = false,
) => {
	const token = tokenFrom(request);
	if (!token) return response.status(401).json({ message: "Please login to continue" });
	try {
		request.user = await validateAccessToken(token);
		if (!allowExpiredPassword && request.user.isPasswordExpired) {
			return sendResponse(response, 403, "FORBIDDEN", "Password has expired, Please update your password!");
		}
		return next();
	} catch {
		return response.status(401).json({ message: "Invalid, expired, or revoked token" });
	}
};
const requireRole = (role: string, message: string) =>
	async (request: ExpandedRequest, response: Response, next: NextFunction) =>
		authenticate(request, response, () =>
			request.user?.role === role
				? next()
				: sendResponse(response, 403, "FORBIDDEN", message),
		);

export const isLogin = async (socket: ExtendedSocket): Promise<boolean> => {
	const token = socket.handshake.auth.token;
	if (!token) throw new Error("UNAUTHORIZED: Token is missing");
	socket.user = await validateAccessToken(token);
	return true;
};

const authenticateUser = (request: ExpandedRequest, response: Response, next: NextFunction) =>
	authenticate(request, response, next);

const is_authenticated_when_password_expired = (
	request: ExpandedRequest,
	response: Response,
	next: NextFunction,
) => authenticate(request, response, next, true);
const isBuyer = requireRole("BUYER", "Only buyer can perform this action!");
const isSeller = requireRole("SELLER", "Only seller can perform this action!");
const isAdmin = requireRole("ADMIN", "Only admin can perform this action!");

export default {
	is_authenticated_when_password_expired,
	authenticateUser,
	isBuyer,
	isSeller,
	isAdmin,
	isLogin,
};
