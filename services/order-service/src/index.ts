import express from "express";
import orderRoutes from "./routes/orderRoutes";
import salesRoutes from "./routes/salesRoute";
import { connectionToDatabase } from "./database/config/db.config";
import { statisticsRouter } from "./routes/statisticsRoutes";
import { AdminstatisticsRouter } from "./routes/adminStatsRoute";
import databaseModels from "./database/config/db.config";

const app = express();
app.use(express.json());
app.get("/health", (_request, response) =>
	response.json({ service: "order-service", status: "ok" }),
);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/statistics", statisticsRouter);
app.use("/api/v1/admin-statistics", AdminstatisticsRouter);
app.post("/internal/orders/checkout", async (request, response) => {
	const { userId, products = [] } = request.body as {
		userId: string;
		products: Array<{ id: string; quantity: number }>;
	};
	if (!userId || products.length === 0) {
		return response
			.status(400)
			.json({ message: "userId and products are required" });
	}
	const order = await databaseModels.Order.create({
		buyerId: userId,
		status: "pending",
	});
	const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
	for (const product of products) {
		await databaseModels.Sales.create({
			orderId: order.id,
			buyerId: userId,
			productId: product.id,
			quantitySold: product.quantity,
			deliveryDate,
			status: "pending",
		});
	}
	return response.status(201).json(order);
});

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3004);
		app.listen(port, () => console.log(`order-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to order database", error);
		process.exit(1);
	});
