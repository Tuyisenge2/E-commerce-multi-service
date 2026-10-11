import express from "express";
import paymentRouter from "./routes/paymentsRoutes";
import { connectionToDatabase } from "./database/config/db.config";

const app = express();
app.use(express.json());
app.get("/health", (_request, response) =>
	response.json({ service: "payment-service", status: "ok" }),
);
app.use("/api/v1/payments", paymentRouter);

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3005);
		app.listen(port, () => console.log(`payment-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to payment database", error);
		process.exit(1);
	});
