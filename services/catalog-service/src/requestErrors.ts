import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ValidationError } from "sequelize";

export const asyncHandler =
	(handler: (req: Request, res: Response, next: NextFunction) => unknown) =>
	async (req: Request, res: Response, next: NextFunction) => {
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
	if (error?.name === "MulterError") {
		res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
			message: error.code === "LIMIT_FILE_SIZE" ? "Each image must be at most 5 MB" : "Invalid upload: use at most 8 files in the images field",
		});
		return;
	}
	if (error?.status === 400) {
		res.status(400).json({ message: error.message });
		return;
	}
	if (error instanceof ValidationError) {
		res.status(400).json({
			message: "Invalid request data",
			errors: error.errors.map((item) => ({
				field: item.path,
				message: item.message,
			})),
		});
		return;
	}
	if (error?.type === "entity.parse.failed") {
		res.status(400).json({ message: "Invalid JSON body" });
		return;
	}
	console.error(`Catalog request failed: ${req.method} ${req.path}`, error);
	res.status(500).json({ message: "Unable to complete request" });
};
