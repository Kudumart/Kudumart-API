import { DropshipperClient } from "ae_sdk";

interface ProductSearchOptions {
	keywords: string;
	categoryId: string;
	minPrice?: number;
	maxPrice?: number;
	shipToCountry?: string;
	pageNo?: number;
	pageSize?: number;
}

interface OrderCreateData {
	products: Array<{
		order_memo?: string;
		product_id: number;
		product_count: number;
		sku_attr?: string;
	}>;
	shippingAddress: {
		contact_person: string;
		country: string;
		province: string;
		city: string;
		address: string;
		address2?: string;
		zip: string;
		mobile_no?: string;
		full_name?: string;
	};
	payment: {
		pay_currency?: "USD" | "GBP" | "CAD" | "EUR";
		try_to_pay?: "true" | "false";
	};
	businessModel: "retail" | "wholesale";
}

export class DropShippingService {
	private readonly dropShipperClient: DropshipperClient;

	constructor() {
		this.dropShipperClient = new DropshipperClient({
			app_key: process.env.ALIEXPRESS_APP_KEY || "",
			app_secret: process.env.ALIEXPRESS_APP_SECRET || "",
			session: process.env.DROPSHIPPER_SESSION || "",
		});
	}

	async getAuthorizationUrl(): Promise<string> {
		const redirectUri = `${process.env.ALIEXPRESS_AUTH_REDIRECT_URI}?response_type=code&redirect_uri=${encodeURIComponent(
			process.env.ALIEXPRESS_AUTH_CALLBACK_URL || "",
		)}&client_id=${process.env.DROPSHIPPER_APP_KEY}`;

		return redirectUri;
	}

	async getAccessToken(code: string) {
		const response = await this.dropShipperClient.generateToken({
			code,
		});
		if (!response.ok) {
			throw new Error(
				"Failed to generate access token from the dropshipper API",
			);
		}

		if (!response.data) {
			throw new Error("No data returned from the dropshipper API");
		}
		const accessTokenData = response.data;
		if (!accessTokenData) {
			throw new Error("No token data found in the response");
		}

		return {
			accessToken: accessTokenData.access_token,
			refreshToken: accessTokenData.refresh_token,
			expiresIn: accessTokenData.expires_in,
			expireTime: accessTokenData.expire_time,
			userId: accessTokenData.user_id,
			userNick: accessTokenData.user_nick,
			refreshExpiresIn: accessTokenData.refresh_expires_in,
			refreshTokenValidTime: accessTokenData.refresh_token_valid_time,
			sp: accessTokenData.sp,
			locale: accessTokenData.locale,
			account: accessTokenData.account,
			accountId: accessTokenData.account_id,
			accountPlatform: accessTokenData.account_platform,
			havanaId: accessTokenData.havana_id,
			sellerId: accessTokenData.seller_id,
		};
	}

	async refreshAccessToken(refreshToken: string) {
		const response = await this.dropShipperClient.refreshToken({
			refresh_token: refreshToken,
		});
		if (!response.ok) {
			throw new Error(
				"Failed to refresh access token from the dropshipper API",
			);
		}

		if (!response.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		const accessTokenData = response.data;

		if (!accessTokenData) {
			throw new Error("No token data found in the response");
		}

		return {
			accessToken: accessTokenData.access_token,
			refreshToken: accessTokenData.refresh_token,
			expiresIn: accessTokenData.expires_in,
			expireTime: accessTokenData.expire_time,
			userId: accessTokenData.user_id,
			userNick: accessTokenData.user_nick,
			refreshExpiresIn: accessTokenData.refresh_expires_in,
			refreshTokenValidTime: accessTokenData.refresh_token_valid_time,
			sp: accessTokenData.sp,
			locale: accessTokenData.locale,
			account: accessTokenData.account,
			accountId: accessTokenData.account_id,
			accountPlatform: accessTokenData.account_platform,
			havanaId: accessTokenData.havana_id,
			sellerId: accessTokenData.seller_id,
		};
	}

	async getProductCategories() {
		try {
			const response = await this.dropShipperClient.getCategories({});

			if (!response.ok) {
				// console.log(response);
				console.log(response);
				throw new Error(
					"Failed to fetch product categories from the dropshipper API",
				);
			}

			if (!response.data) {
				throw new Error("No data returned from the dropshipper API");
			}

			const { data } = response;
			const { aliexpress_ds_category_get_response } = data;
			if (!aliexpress_ds_category_get_response) {
				throw new Error("No category data found in the response");
			}

			const { resp_result } = aliexpress_ds_category_get_response;

			if (!resp_result || !resp_result.result) {
				throw new Error("No category list found in the response");
			}

			const categories = resp_result.result;

			return categories.categories;
		} catch (error) {
			console.log(error);
			throw error; // Re-throw the error for further handling
		}
	}

	async getProducts(options: ProductSearchOptions) {
		const response = await this.dropShipperClient.callAPIDirectly(
			"aliexpress.ds.text.search",
			{
				KeyWord: options.keywords || "",
				categoryId: options.categoryId,
				countryCode: options.shipToCountry || "NG",
				currency: "USD",
				pageIndex: options.pageNo || 1,
				pageSize: options.pageSize || 20,
				local: "en_US",
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch products from the dropshipper API");
		}

		if (!response.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		return response.data;
	}

	async getProductById(productId: number, shipToCountry: string) {
		const response = await this.dropShipperClient.productDetails({
			product_id: productId,
			ship_to_country: shipToCountry,
		});

		if (!response.ok) {
			throw new Error(
				"Failed to fetch product details from the dropshipper API",
			);
		}

		if (!response.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		const { aliexpress_ds_product_get_response } = response.data;

		if (!aliexpress_ds_product_get_response) {
			throw new Error("No product data found in the response");
		}

		const { result } = aliexpress_ds_product_get_response;
		if (!result) {
			throw new Error("No product details result found in the response");
		}

		const product = result;

		return product;
	}

	async createOrder(createOrderData: OrderCreateData) {
		const response = await this.dropShipperClient.createOrder({
			logistics_address: createOrderData.shippingAddress,
			product_items: createOrderData.products,
			promo_and_payment: {
				payment: {
					pay_currency: createOrderData.payment.pay_currency,
					try_to_pay: createOrderData.payment.try_to_pay,
				},
				trade_extra_param: {
					business_model: createOrderData.businessModel,
				},
			},
		});

		if (!response.ok) {
			throw new Error("Failed to create order in the dropshipper API");
		}

		const { aliexpress_trade_buy_placeorder_response } = response.data;
		if (!aliexpress_trade_buy_placeorder_response) {
			throw new Error("No order creation response found in the API response");
		}

		const { result } = aliexpress_trade_buy_placeorder_response;
		if (!result) {
			throw new Error("No order creation result found in the API response");
		}

		if (!result.is_success) {
			throw new Error(
				`Order creation failed: ${result.error_msg || "Unknown error"}`,
			);
		}

		const orderList = result.order_list;

		return orderList;
	}

	async getOrderStatus(orderId: number) {
		// const response = await this.dropShipperClient.orderDetails({
		// 	order_id: orderId,
		// });

		const responseData = await this.dropShipperClient.callAPIDirectly(
			"aliexpress.ds.order.tracking.get",
			{
				ae_order_id: orderId,
				language: "en_US",
			},
		);

		if (!responseData.ok) {
			throw new Error("Failed to fetch order status from the dropshipper API");
		}

		if (!responseData.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		return responseData.data;
	}
}
