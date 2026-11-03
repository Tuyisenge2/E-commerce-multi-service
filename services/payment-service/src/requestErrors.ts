import { ErrorRequestHandler, RequestHandler } from "express";

export const asyncHandler =
	(handler: RequestHandler): RequestHandler =>
	async (req, res, next) => {
		try {
			await handler(req, res, next);
		} catch (error) {
			next(error);
		}
	};

export const requestErrorHandler: ErrorRequestHandler = (
	error,
	req,
	res,
	next,
) => {
	if (res.headersSent) return next(error);
	if (
		[
			"SequelizeValidationError",
			"SequelizeUniqueConstraintError",
			"SequelizeForeignKeyConstraintError",
		].includes(error?.name)
	) {
		res.status(400).json({ message: "Invalid request data" });
		return;
	}
	if (error?.type === "entity.parse.failed") {
		res.status(400).json({ message: "Invalid JSON body" });
		return;
	}
	const status = Number(error?.status ?? error?.statusCode);
	if (Number.isInteger(status) && status >= 400 && status < 500) {
		res.status(status).json({ message: "Request rejected" });
		return;
	}
	console.error(
		`Request failed: ${req.method} ${req.path}`,
		error?.name ?? "Error",
	);
	res.status(500).json({ message: "Unable to complete request" });
};
