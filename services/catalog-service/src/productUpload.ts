import { RequestHandler } from "express";
import multer from "multer";
import Joi from "joi";
import cloudinary from "./helpers/cloudinary";
import { productValidation } from "./validations/product.validation";

export const parseProductUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024, files: 8, fields: 20 },
	fileFilter: (_req, file, callback) => {
		if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
			return callback(Object.assign(new Error("Use JPEG, PNG, WebP or GIF images"), { status: 400 }));
		}
		callback(null, true);
	},
}).array("images", 8);

const imageUrls = Joi.array().items(Joi.string().uri({ scheme: ["https", "http"] }));
const createSchema = productValidation.keys({
	discount: Joi.number().min(0).max(100).default(0),
	quantity: Joi.number().integer().min(0).required(),
	categoryId: Joi.string().guid().required(),
	images: imageUrls,
});
const updateSchema = createSchema.fork(
	["name", "price", "quantity", "categoryId", "expiryDate"],
	(schema) => schema.optional(),
).keys({ discount: Joi.number().min(0).max(100) });

export const prepareProductImages = (updating = false): RequestHandler =>
	async (req, res, next) => {
		try {
			const files = (req.files ?? []) as Express.Multer.File[];
			const body = { ...req.body };
			delete body.sellerId;
			delete body.id;
			if (typeof body.images === "string") body.images = [body.images];
			const { error, value } = (updating ? updateSchema : createSchema).validate(body, { abortEarly: false });
			if (error) {
				res.status(400).json({ message: "Invalid product data", errors: error.details.map((item) => ({ field: item.path.join("."), message: item.message })) });
				return;
			}
			const existingImages: string[] = value.images ?? [];
			if ((!updating && !files.length && !existingImages.length) || files.length + existingImages.length > 8) {
				res.status(400).json({ message: "Provide between 1 and 8 product images" });
				return;
			}
			if (files.length) {
				if (process.env.ENABLE_CLOUDINARY !== "true" || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
					res.status(503).json({ message: "Image uploads are not configured" });
					return;
				}
				const uploaded: string[] = [];
				try {
					for (const file of files) {
						const result = await cloudinary.uploader.upload(
							`data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
							{ folder: process.env.CLOUDINARY_FOLDER_NAME, resource_type: "image" },
						);
						uploaded.push(result.public_id);
						existingImages.push(result.secure_url);
					}
				} catch {
					await Promise.allSettled(uploaded.map((id) => cloudinary.uploader.destroy(id)));
					res.status(502).json({ message: "Image upload failed. Please try again." });
					return;
				}
				value.images = existingImages;
			}
			req.body = value;
			next();
		} catch (error) {
			next(error);
		}
	};
