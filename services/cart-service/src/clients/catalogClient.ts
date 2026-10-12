import { ProductAttributes } from "../types/model";

export const getProductById = async (productId: string): Promise<ProductAttributes> => {
	const baseUrl = process.env.CATALOG_SERVICE_URL ?? "http://catalog-service:3002";
	const response = await fetch(`${baseUrl}/internal/products/${productId}`);
	if (response.status === 404) throw new Error("PRODUCT_NOT_FOUND");
	if (!response.ok) throw new Error("Catalog service unavailable");
	return (await response.json()) as ProductAttributes;
};
