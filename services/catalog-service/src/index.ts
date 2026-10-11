import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { DataTypes, Model, Op, Sequelize } from "sequelize";
import productRouter from "./routes/productRoutes";
import categoryRouter from "./routes/categoryRoutes";
import reviewRouter from "./routes/review.routes";
import wishesRouter from "./routes/wishesRoutes";

const db = new Sequelize(process.env.DB_DEV_URL ?? "", {
	dialect: "postgres",
	define: { schema: process.env.DB_SCHEMA || "public" },
	logging: false,
});
const secret = process.env.ACCESS_TOKEN_SECRET ?? "local-user-service-secret";
class Category extends Model {
	declare id: string;
	declare name: string;
	declare description: string;
}
Category.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING, allowNull: false },
	},
	{ sequelize: db, tableName: "categories" },
);
class Product extends Model {
	declare id: string;
	declare name: string;
	declare price: number;
	declare images: string[];
	declare discount: number;
	declare quantity: number;
	declare sellerId: string;
	declare categoryId: string;
	declare expiryDate: Date;
	declare isAvailable: boolean;
}
Product.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: { type: DataTypes.STRING, allowNull: false },
		price: { type: DataTypes.FLOAT, allowNull: false },
		images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
		discount: { type: DataTypes.FLOAT, allowNull: false },
		quantity: { type: DataTypes.INTEGER, allowNull: false },
		sellerId: { type: DataTypes.UUID, allowNull: false },
		categoryId: { type: DataTypes.UUID, allowNull: false },
		expiryDate: { type: DataTypes.DATE, allowNull: false },
		isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
	},
	{ sequelize: db, tableName: "products" },
);
class Review extends Model {
	declare id: string;
	declare userId: string;
	declare productId: string;
	declare feedBack: string;
	declare ratings: number;
}
Review.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: { type: DataTypes.UUID, allowNull: false },
		productId: { type: DataTypes.UUID, allowNull: false },
		feedBack: { type: DataTypes.STRING, allowNull: false },
		ratings: { type: DataTypes.FLOAT, allowNull: false },
	},
	{ sequelize: db, tableName: "reviews" },
);
class Wish extends Model {
	declare id: string;
	declare userId: string;
	declare productId: string;
}
Wish.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: { type: DataTypes.UUID, allowNull: false },
		productId: { type: DataTypes.UUID, allowNull: false },
	},
	{ sequelize: db, tableName: "wishes" },
);

type AuthRequest = Request & { user?: JwtPayload };
const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.replace("Bearer ", "");
	if (!token) {
		return res.status(401).json({ message: "Please login to continue" });
	}
	try {
		const decoded = jwt.verify(token, secret);
		if (typeof decoded === "string") {
			return res.status(401).json({ message: "Invalid token" });
		}
		req.user = decoded;
		return next();
	} catch {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
const seller = (req: AuthRequest, res: Response, next: NextFunction) =>
	req.user?.role === "SELLER" || req.user?.role === "ADMIN"
		? next()
		: res.status(403).json({ message: "Seller access required" });
const buyer = (req: AuthRequest, res: Response, next: NextFunction) =>
	req.user?.role === "BUYER"
		? next()
		: res.status(403).json({ message: "Buyer access required" });
const app = express();
app.use(express.json());
app.use("/api/v1/products-original", productRouter);
app.use("/api/v1/categories-original", categoryRouter);
app.use("/api/v1/reviews-original", reviewRouter);
app.use("/api/v1/wishes-original", wishesRouter);
app.get("/health", (_req, res) =>
	res.json({ service: "catalog-service", status: "ok" }),
);
app.get("/internal/products/:id", async (req, res) => {
	const item = await Product.findByPk(req.params.id);
	return item
		? res.json(item)
		: res.status(404).json({ message: "Product not found" });
});
app.get("/api/v1/categories", async (_req, res) =>
	res.json(await Category.findAll()),
);
app.get("/api/v1/categories/:id", async (req, res) => {
	const item = await Category.findByPk(req.params.id);
	return item
		? res.json(item)
		: res.status(404).json({ message: "Category not found" });
});
app.post("/api/v1/categories", auth, seller, async (req, res) =>
	res.status(201).json(await Category.create(req.body)),
);
app.patch("/api/v1/categories/:id", auth, seller, async (req, res) => {
	const item = await Category.findByPk(req.params.id);
	if (!item) return res.status(404).json({ message: "Category not found" });
	await item.update(req.body);
	return res.json(item);
});
app.get("/api/v1/products/search", async (req, res) => {
	const q = String(req.query.q ?? "");
	return res.json(
		await Product.findAll({ where: { name: { [Op.iLike]: `%${q}%` } } }),
	);
});
app.get("/api/v1/products/guest-products", async (_req, res) =>
	res.json(await Product.findAll({ where: { isAvailable: true } })),
);
app.get("/api/v1/products", auth, async (_req, res) =>
	res.json(await Product.findAll()),
);
app.get("/api/v1/products/:id", async (req, res) => {
	const item = await Product.findByPk(req.params.id);
	return item
		? res.json(item)
		: res.status(404).json({ message: "Product not found" });
});
app.get("/api/v1/products/:id/reviews", async (req, res) =>
	res.json(await Review.findAll({ where: { productId: req.params.id } })),
);
app.post("/api/v1/products", auth, seller, async (req: AuthRequest, res) =>
	res
		.status(201)
		.json(await Product.create({ ...req.body, sellerId: req.user?.id })),
);
app.patch("/api/v1/products/:id", auth, seller, async (req, res) => {
	const item = await Product.findByPk(req.params.id);
	if (!item) return res.status(404).json({ message: "Product not found" });
	await item.update(req.body);
	return res.json(item);
});
app.patch(
	"/api/v1/products/:id/availability-status",
	auth,
	seller,
	async (req, res) => {
		const item = await Product.findByPk(req.params.id);
		if (!item) return res.status(404).json({ message: "Product not found" });
		await item.update({ isAvailable: !item.isAvailable });
		return res.json(item);
	},
);
app.post("/api/v1/products/recommended", auth, async (req, res) => {
	const item = await Product.findByPk(req.body.id);
	if (!item) return res.status(404).json({ message: "Product not found" });
	return res.json(
		await Product.findAll({
			where: {
				categoryId: item.categoryId,
				isAvailable: true,
				id: { [Op.ne]: item.id },
			},
			limit: 5,
			order: [["createdAt", "DESC"]],
		}),
	);
});
app.delete("/api/v1/products/:id", auth, seller, async (req, res) => {
	const item = await Product.findByPk(req.params.id);
	if (!item) return res.status(404).json({ message: "Product not found" });
	await item.destroy();
	return res.json({ message: "Product deleted" });
});
app.get("/api/v1/reviews", async (_req, res) =>
	res.json(await Review.findAll()),
);
app.post("/api/v1/reviews", auth, buyer, async (req: AuthRequest, res) =>
	res
		.status(201)
		.json(await Review.create({ ...req.body, userId: req.user?.id })),
);
app.patch("/api/v1/reviews/:id", auth, async (req, res) => {
	const item = await Review.findByPk(req.params.id);
	if (!item) return res.status(404).json({ message: "Review not found" });
	await item.update(req.body);
	return res.json(item);
});
app.delete("/api/v1/reviews/:id", auth, async (req, res) => {
	const item = await Review.findByPk(req.params.id);
	if (!item) return res.status(404).json({ message: "Review not found" });
	await item.destroy();
	return res.json({ message: "Review deleted" });
});
app.post("/api/v1/wishes", auth, buyer, async (req: AuthRequest, res) => {
	const existing = await Wish.findOne({
		where: { productId: req.body.productId, userId: req.user?.id },
	});
	if (existing) {
		await existing.destroy();
		return res.json({ message: "Product removed from wishlist" });
	}
	return res.status(201).json(
		await Wish.create({
			productId: req.body.productId,
			userId: req.user?.id,
		}),
	);
});
app.get("/api/v1/wishes", auth, async (req: AuthRequest, res) =>
	res.json(await Wish.findAll({ where: { userId: req.user?.id } })),
);
db.authenticate()
	.then(() =>
		app.listen(Number(process.env.PORT ?? 3002), () =>
			console.log("catalog-service listening on 3002"),
		),
	)
	.catch((error) => {
		console.error("Unable to connect to catalog database", error);
		process.exit(1);
	});
