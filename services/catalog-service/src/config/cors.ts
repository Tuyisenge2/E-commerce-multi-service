import { CorsOptions } from "cors";

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

export const corsOptions: CorsOptions = {
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error(`CORS blocked request from origin: ${origin}`));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Authorization", "Content-Type"],
};
