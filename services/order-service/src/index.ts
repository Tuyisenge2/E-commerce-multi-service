import express from "express";
import orderRoutes from "./routes/orderRoutes";
import salesRoutes from "./routes/salesRoute";
import { connectionToDatabase } from "./database/config/db.config";

const app = express();
app.use(express.json());
app.get("/health", (_request, response) => response.json({ service: "order-service", status: "ok" }));
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/sales", salesRoutes);

connectionToDatabase().then(() => {
	const port = Number(process.env.PORT ?? 3004);
	app.listen(port, () => console.log(`order-service listening on ${port}`));
}).catch((error) => {
	console.error("Unable to connect to order database", error);
	process.exit(1);
});
