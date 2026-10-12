import { stripe } from "../controllers/paymentController";
import { cartItem } from "../types/cart";
import {
	PaymentsModelAttributes,
	UserModelAttributes,
	cartModelAttributes,
} from "../types/model";
import { PaymentDetails } from "../types/payment";
import { insert_function, read_function } from "../utils/db_methods";
import { v4 as uuidv4 } from "uuid";
import { getCart, getCartByUserId, clearCartById } from "../clients/cartClient";
import { createOrder, getOrderById } from "../clients/orderClient";

export const findUserCartById = async (userId: string, token?: string) => {
	if (token) return (await getCart(token)) as cartModelAttributes;
	return (await getCartByUserId(userId)) as cartModelAttributes;
};

export const getOrCreateStripeCustomer = async (user: UserModelAttributes) => {
	try {
		const existingCustomer = await stripe.customers.list({ email: user.email });
		if (existingCustomer.data.length > 0) {
			return existingCustomer.data[0];
		} else {
			const customer = await stripe.customers.create({
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				address: {
					country: user.country,
					city: user.city,
					line1: user.addressLine1,
					line2: user.addressLine2,
				},
			});
			return customer;
		}
	} catch (error) {
		console.error(
			"Error while getting or creating stripe customer:",
			(error as Error).message,
		);
		throw error;
	}
};

export const lineCartItems = (cart: cartModelAttributes) => {
	const line_items = [];
	const products: cartItem[] = cart.products;
	for (const product of products) {
		const line_item_obj = {
			price_data: {
				currency: "rwf",
				product_data: {
					name: product.name,
					images: [product.image],
				},
				unit_amount: Math.floor(
					product.price - (product.price * product.discount) / 100,
				),
			},
			quantity: product.quantity,
		};
		line_items.push(line_item_obj);
	}
	return line_items;
};
export const getPaymentBySession = async (sessionId: string) => {
	return await read_function<PaymentDetails>("Payments", "findOne", {
		where: { sessionId },
	});
};

export const recordPaymentDetails = async (paymentDetails: PaymentDetails) => {
	const paymantDetails = await insert_function<PaymentsModelAttributes>(
		"Payments",
		"create",
		paymentDetails,
	);
	if ("error" in paymantDetails) {
		throw new Error("Error while recording payment details!");
	}
	return paymantDetails;
};
export const readOrderById = async (orderId: string) => {
	return await getOrderById(orderId);
};

export const orderItems = async (cart: cartModelAttributes, token?: string) => {
	const order = await createOrder({
		userId: cart.userId,
		products: cart.products.map((product) => ({ id: product.id, quantity: product.quantity })),
	}, token);
	await clearCartById(cart.id);
	return order;
};
export function generateUUID() {
	const uuid = uuidv4();
	return uuid;
}
