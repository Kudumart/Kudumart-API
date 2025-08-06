import { DropshipperClient } from "ae_sdk";

export class DropShippingService {
	private readonly dropShipperClient: DropshipperClient;

	constructor() {
		this.dropShipperClient = new DropshipperClient({
			app_key: process.env.DROPSHIPPER_APP_KEY || "",
			app_secret: process.env.DROPSHIPPER_APP_SECRET || "",
			session: process.env.DROPSHIPPER_SESSION || "",
		});
	}

	async getProductCategories() {
		const response = await this.dropShipperClient.getCategories({});

		return response;
	}

	async getProducts(
		KeyWord: string,
		categoryId: string,
		countryCode: string,
		currency: string,
		pageIndex: number = 1,
		pageSize: number = 20,
	) {
		const response = await this.dropShipperClient.callAPIDirectly(
			"aliexpress.ds.text.search",
			{
				KeyWord,
				categoryId,
				countryCode,
				currency,
				pageIndex,
				pageSize,
				local: "en_US",
			},
		);

		return response;
	}

	async getProductById(productId: number, shipToCountry: string) {
		const response = await this.dropShipperClient.productDetails({
			product_id: productId,
			ship_to_country: shipToCountry,
		});
		return response;
	}

	async createOrder() {
		// Logic to create an order in the drop shipping system
	}

	async getOrderStatus(orderId: number) {
		const response = await this.dropShipperClient.orderDetails({
			order_id: orderId,
		});
		return response;
	}
}
