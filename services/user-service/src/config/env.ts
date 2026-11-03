import { config } from "dotenv";

config();

const value = (name: string) => process.env[name]?.trim();
const enabled = (name: string) => value(name)?.toLowerCase() === "true";

const required = [
	"ACCESS_TOKEN_SECRET",
	"SESSION_SECRET",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_SECRET_ID",
	"GOOGLE_CALLBACK_URL",
];
const mode = value("DEV_MODE") ?? "development";

if (mode === "production") required.push("DB_PROD_URL");
else if (mode === "test") required.push("DB_TEST_URL");
else required.push("DB_DEV_URL");

if (enabled("ENABLE_EMAIL")) {
	required.push("EMAIL", "PASSWORD", "SENDER_NAME", "BASE_URL");
}
if (enabled("ENABLE_CLOUDINARY")) {
	required.push(
		"CLOUDINARY_CLOUD_NAME",
		"CLOUDINARY_API_KEY",
		"CLOUDINARY_API_SECRET",
	);
}

const missing = required.filter((name) => !value(name));
if (missing.length > 0) {
	throw new Error(
		`user-service configuration error: missing environment variables: ${missing.join(", ")}`,
	);
}

if ((value("ACCESS_TOKEN_SECRET")?.length ?? 0) < 32) {
	throw new Error(
		"user-service configuration error: ACCESS_TOKEN_SECRET must contain at least 32 characters",
	);
}
if ((value("SESSION_SECRET")?.length ?? 0) < 32) {
	throw new Error(
		"user-service configuration error: SESSION_SECRET must contain at least 32 characters",
	);
}

export const env = {
	sellerEmailOtpBypassed:
		mode === "development" && enabled("BYPASS_SELLER_EMAIL_OTP"),
	emailEnabled: enabled("ENABLE_EMAIL"),
	cloudinaryEnabled: enabled("ENABLE_CLOUDINARY"),
};
