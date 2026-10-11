import express from "express";
import cartRouter from "./routes/cartRoutes";
import { connectionToDatabase } from "./database/config/db.config";
import databaseModels from "./database/config/db.config";

const app = express();
app.use(express.json());
app.get("/health", (_request, response) =>
	response.json({ service: "cart-service", status: "ok" }),
);
app.use("/api/v1/carts", cartRouter);
app.get("/internal/carts/:userId", async (request, response) => {
	const cart = await databaseModels.Cart.findOne({
		where: { userId: request.params.userId },
	});
	return cart
		? response.json(cart)
		: response.status(404).json({ message: "Cart not found" });
});
app.delete("/internal/carts/:cartId", async (request, response) => {
	await databaseModels.Cart.destroy({ where: { id: request.params.cartId } });
	return response.json({ message: "Cart cleared" });
});

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3003);
		app.listen(port, () => console.log(`cart-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to cart database", error);
		process.exit(1);
	});
