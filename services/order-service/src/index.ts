import { asyncHandler, requestErrorHandler } from "./requestErrors";
import express from "express";
import cors from "cors";
import {
	connectionToDatabase,
	sequelizeConnection,
} from "./database/config/db.config";
import databaseModels from "./database/config/db.config";
import auth, { ExpandedRequest } from "./middlewares/auth";
import { corsOptions } from "./config/cors";

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.get(
	"/health",
	asyncHandler((_request, response) =>
		response.json({ service: "order-service", status: "ok" }),
	),
);
app.get(
	"/api/v1/orders",
	asyncHandler(auth.authenticateUser),
	asyncHandler(async (request: ExpandedRequest, response) =>
		response.json(
			await databaseModels.Order.findAll({
				where: { buyerId: request.user?.id },
			}),
		),
	),
);
app.get(
	"/api/v1/orders/:id",
	asyncHandler(auth.authenticateUser),
	asyncHandler(async (request: ExpandedRequest, response) => {
		const order = await databaseModels.Order.findOne({
			where: { id: request.params.id, buyerId: request.user?.id },
			include: [{ model: databaseModels.Sales, as: "sales" }],
		});
		return order
			? response.json(order)
			: response.status(404).json({ message: "Order not found" });
	}),
);
app.get(
	"/internal/orders/:id",
	asyncHandler(async (request, response) => {
		const order = await databaseModels.Order.findByPk(request.params.id, {
			include: [{ model: databaseModels.Sales, as: "sales" }],
		});
		return order
			? response.json(order)
			: response.status(404).json({ message: "Order not found" });
	}),
);
app.get(
	"/internal/purchases/:buyerId/:productId",
	asyncHandler(async (request, response) => {
		const sale = await databaseModels.Sales.findOne({
			where: {
				buyerId: request.params.buyerId,
				productId: request.params.productId,
				status: "delivered",
			},
		});
		return response.json({ purchased: Boolean(sale), sale });
	}),
);
app.post(
	"/internal/orders/checkout",
	asyncHandler(async (request, response) => {
		const { userId, products = [] } = request.body as {
			userId: string;
			products: Array<{ id: string; quantity: number }>;
		};
		if (!userId || products.length === 0) {
			return response
				.status(400)
				.json({ message: "userId and products are required" });
		}
		try {
			const order = await sequelizeConnection.transaction(
				async (transaction) => {
					const createdOrder = await databaseModels.Order.create(
						{ buyerId: userId, status: "pending" },
						{ transaction },
					);
					const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
					for (const product of products) {
						await databaseModels.Sales.create(
							{
								orderId: createdOrder.id,
								buyerId: userId,
								productId: product.id,
								quantitySold: product.quantity,
								deliveryDate,
								status: "pending",
							},
							{ transaction },
						);
					}
					return createdOrder;
				},
			);
			return response.status(201).json(order);
		} catch (error) {
			console.error("Unable to create checkout order", error);
			return response.status(500).json({ message: "Unable to create order" });
		}
	}),
);

app.use(requestErrorHandler);

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3004);
		app.listen(port, () => console.log(`order-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to order database", error);
		process.exit(1);
	});
