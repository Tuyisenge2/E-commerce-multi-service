import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.get("/health", (_request, response) => {
	response.json({
		service: process.env.SERVICE_NAME ?? "service-template",
		status: "ok",
	});
});

app.listen(port, () => {
	console.log(
		`${process.env.SERVICE_NAME ?? "service-template"} listening on ${port}`,
	);
});
