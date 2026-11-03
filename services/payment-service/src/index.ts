import { asyncHandler, requestErrorHandler } from "./requestErrors";
import express from "express";
import cors from "cors";
import paymentRouter from "./routes/paymentsRoutes";
import { connectionToDatabase } from "./database/config/db.config";
import { corsOptions } from "./config/cors";

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.get(
	"/health",
	asyncHandler((_request, response) =>
		response.json({ service: "payment-service", status: "ok" }),
	),
);
app.use("/api/v1/payments", paymentRouter);

app.use(requestErrorHandler);

connectionToDatabase()
	.then(() => {
		const port = Number(process.env.PORT ?? 3005);
		app.listen(port, () => console.log(`payment-service listening on ${port}`));
	})
	.catch((error) => {
		console.error("Unable to connect to payment database", error);
		process.exit(1);
	});
