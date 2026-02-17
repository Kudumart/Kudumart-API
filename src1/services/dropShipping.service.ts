import { AE_Currency, DropshipperClient } from "ae_sdk";
import crypto from "node:crypto";
import axios from "axios";
import DropShippingCred from "../models/dropshippngCreds";
import { NotFoundError } from "../utils/ApiError";

interface ProductSearchOptions {
	vendorId: string;
	keywords: string;
	categoryId: string;
	minPrice?: number;
	maxPrice?: number;
	shipToCountry?: string;
	pageNo?: number;
	pageSize?: number;
	currency?: AE_Currency;
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
		locale: string;
		zip: string;
		mobile_no?: string;
		phone_country: string;
		full_name?: string;
	};
	payment: {
		pay_currency?: "USD" | "GBP" | "CAD" | "EUR";
		try_to_pay?: "true" | "false";
	};
	businessModel: "retail" | "wholesale";
}

interface AES_GENERATE_TOKEN_RESULT {
	refresh_token_valid_time: string;
	havana_id: number;
	expire_time: string;
	locale: string;
	user_nick: string;
	access_token: string;
	refresh_token: string;
	user_id: number;
	account_platform: number;
	refresh_expires_in: number;
	expires_in: number;
	sp: string;
	seller_id: number;
	account: string;
	code: string;
	request_id: string;
	_trace_id_: string;
}

interface ShippingInfoArgs {
	sku_id?: string;
	ship_to_city_code?: string;
	ship_to_country_code: string;
	ship_to_province_code?: string;
	product_id: number;
	product_num: number;
	price_currency?: AE_Currency;
}

interface DeliveryOption {
	shipping_fee_format: string;
	delivery_date_desc: string;
	code: string;
	free_shipping: boolean;
	max_delivery_days: number;
	estimated_delivery_time: string;
	min_delivery_days: number;
	shipping_fee_currency: string;
	ship_from_country: string;
	company: string;
	shipping_fee_cent: string;
	tracking: boolean;
	mayHavePFS: boolean;
	available_stock: string;
	guaranteed_delivery_days: string;
	ddpIncludeVATTax: string;
	free_shipping_threshold: string;
}

interface Result {
	msg: string;
	delivery_options: {
		delivery_option_d_t_o: DeliveryOption[];
	};
}

interface AES_SHIPPING_INFO_RESULT {
	aliexpress_ds_freight_query_response: { result: Result };
	code: number;
	success: boolean;
}

interface Amount {
	amount: string;
	currency_code: string;
}

interface ChildOrder {
	actual_tax_fee?: Amount[];
	actual_shipping_fee?: Amount[];
	already_include_tax?: string;
	shipping_fee?: Amount[];
	sale_discount_fee?: Amount[];
	sale_fee?: Amount[];
	actual_fee?: Amount[];
	shipping_discount_fee?: Amount[];
	end_reason?: string;
	sku_id?: string;
	product_id: number;
	product_price?: Amount[];
	product_name: string;
	product_count: number;
}

interface LogisticsInfo {
	logistics_no?: string;
	logistics_service?: string;
}

interface StoreInfo {
	store_id: number;
	store_name: string;
	store_url: string;
}

interface UserOrderAmount {
	pay_timeout_second?: string;
	order_paidtime_string?: string;
	gmt_create?: string;
	order_status?: string;
	logistics_status?: string;
	amount: string;
	currency_code: string;
}

interface OrderAmount {
	amount: string;
	currency_code: string;
}

interface OrderDetailsResult {
	user_order_amount?: UserOrderAmount[];
	order_amount?: OrderAmount[];
	child_order_list?: {
		aeop_child_order_info: ChildOrder[];
	};
	logistics_info_list?: LogisticsInfo[];
	store_info?: StoreInfo[];
}

interface AliExpressOrderDetailsResponse {
	aliexpress_trade_ds_order_get_response: {
		result: OrderDetailsResult;
	};
}

export interface AddressChild {
	hasChildren: boolean;
	name: string;
	type: string;
	children?: AddressChild[];
}

// The main address data item
export interface AddressDataItem {
	country: string; // country code, e.g. "NG"
	type: string; // address type, e.g. "country"
	children: AddressChild[]; // JSON string of children (parse to AddressChild[])
	msg?: string; // optional error message
}

// Result object in response
export interface AddressGetResult {
	ret: boolean; // is response successful
	code: string; // error code
	data: AddressDataItem; // array of addresses
	msg?: string; // optional error message
}

// Full API response
export interface AliExpressDsAddressGetResponse {
	aliexpress_ds_address_get_response: {
		result: AddressGetResult;
		code: string;
		request_id: string;
	};
}

export interface AliExpressDsOrderCreateResponse {
	aliexpress_ds_order_create_response: {
		result: {
			is_success: boolean;
			order_list: {
				number: number[];
			};
		};
		request_id: string;
	};
}

interface TrackingDetailNode {
	tracking_name: string;
	time_stamp: number;
	tracking_detail_desc: string;
	carrier_name: string;
	eta_time_stamps?: number;
}

interface PackageItem {
	item_id: number;
	quantity: number;
	item_title: string;
	sku_desc: string;
}

interface TrackingDetail {
	mail_no: string;
	tracking_detail_line_list?: TrackingDetailNode[];
	detail_node_list?: TrackingDetailNode[];
	package_item_list?: PackageItem[];
}

interface TrackingResult {
	ret: boolean;
	code: string;
	data?: TrackingDetail;
	msg?: string;
}

interface AliExpressTrackingResponse {
	result: TrackingResult;
}

export class DropShippingService {
	// private dropShipperClient: DropshipperClient;
	//
	// constructor() {
	// 	this.dropShipperClient = new DropshipperClient({
	// 		app_key: process.env.ALIEXPRESS_APP_KEY || "",
	// 		app_secret: process.env.ALIEXPRESS_APP_SECRET || "",
	// 		session: process.env.DROPSHIPPER_SESSION || "",
	// 	});
	// }

	private createClient(session?: string): DropshipperClient {
		return new DropshipperClient({
			app_key: process.env.ALIEXPRESS_APP_KEY || "",
			app_secret: process.env.ALIEXPRESS_APP_SECRET || "",
			session: session || process.env.DROPSHIPPER_SESSION || "",
		});
	}

	async getAuthorizationUrl(): Promise<string> {
		const redirectUri = `${process.env.ALIEXPRESS_AUTH_REDIRECT_URI}?response_type=code&redirect_uri=${encodeURIComponent(
			process.env.ALIEXPRESS_AUTH_CALLBACK_URL || "",
		)}&client_id=${process.env.ALIEXPRESS_APP_KEY}`;

		return redirectUri;
	}

	async getAccessToken(code: string) {
		const response = await generateToken(code);
		if (!response) {
			throw new Error(
				"Failed to generate access token from the dropshipper API",
			);
		}

		const accessTokenData = response;
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
			accountPlatform: accessTokenData.account_platform,
			havanaId: accessTokenData.havana_id,
			sellerId: accessTokenData.seller_id,
		};
	}

	async refreshAccessToken(vendorId: string, refreshToken: string) {
		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const response = await dropShipperClient.refreshToken({
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

	async getProductCategories(vendorId: string) {
		try {
			const vendorAliexpressCreds = await DropShippingCred.findOne({
				where: { vendorId },
			});

			if (!vendorAliexpressCreds) {
				throw new NotFoundError(
					"Dropshipping credentials not found for the vendor",
				);
			}

			const dropShipperClient = this.createClient(
				vendorAliexpressCreds?.accessToken,
			);

			const response = await dropShipperClient.getCategories({});

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
		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId: options.vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const params = {
			// KeyWord: options.keywords || "",
			categoryId: options.categoryId,
			countryCode: options.shipToCountry || "NG",
			currency: options.currency || "USD",
			pageIndex: options.pageNo || 1,
			pageSize: options.pageSize || 20,
			local: "en_US",
			// signature: this.dropShipperClient.app_secret,
		};

		const response = await dropShipperClient.callAPIDirectly(
			"aliexpress.ds.text.search",
			params,
		);

		if (!response.ok) {
			console.log(response);
			throw new Error("Failed to fetch products from the dropshipper API");
		}

		if (!response.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		// const response = await getRequest(
		// 	"https://api-sg.aliexpress.com/rest/aliexpress.ds.text.search",
		// 	{
		// 		KeyWord: options.keywords || "",
		// 		// categoryId: options.categoryId,
		// 		countryCode: options.shipToCountry || "NG",
		// 		currency: "USD",
		// 		pageIndex: options.pageNo || 1,
		// 		pageSize: options.pageSize || 20,
		// 		local: "en_US",
		// 	},
		// );

		return response.data;
	}

	async getProductById(
		vendorId: string,
		productId: number,
		shipToCountry: string,
		targetCurrency: AE_Currency = "USD",
	) {
		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const response = await dropShipperClient.productDetails({
			product_id: productId,
			ship_to_country: shipToCountry,
			target_currency: targetCurrency,
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
			throw new NotFoundError("No product data found in the response");
		}

		const { result } = aliexpress_ds_product_get_response;
		if (!result) {
			throw new Error("No product details result found in the response");
		}

		const product = result;

		return product;
	}

	async createOrder(vendorId: string, createOrderData: OrderCreateData) {
		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const response = await dropShipperClient.callAPIDirectly(
			"aliexpress.ds.order.create",
			{
				param_place_order_request4_open_api_d_t_o: JSON.stringify({
					logistics_address: JSON.stringify(createOrderData.shippingAddress),
					product_items: JSON.stringify(createOrderData.products),
					// promo_and_payment: JSON.stringify({
					// 	payment: {
					// 		pay_currency: createOrderData.payment.pay_currency,
					// 		try_to_pay: createOrderData.payment.try_to_pay,
					// 	},
					// 	trade_extra_param: {
					// 		business_model: createOrderData.businessModel,
					// 	},
					// }),
				}),
			},
		);

		if (!response.ok) { console.log(response);
			throw new Error("Failed to create order in the dropshipper API");
		}

		const { aliexpress_ds_order_create_response } =
			response.data as AliExpressDsOrderCreateResponse;
		if (!aliexpress_ds_order_create_response) {
			throw new Error("No order creation response found in the API response");
		}

		const { result } = aliexpress_ds_order_create_response;
		if (!result) {
			throw new Error("No order creation result found in the API response");
		}

		if (!result.is_success) {
			console.log("Order creation result indicates failure:");
			console.log(result);
			throw new Error(`Order creation failed: ${result || "Unknown error"}`);
		}

		const order_list = result.order_list;

		return order_list.number;
	}

	async getOrderDetails(vendorId: string, orderId: number) {
		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const responseData = await dropShipperClient.callAPIDirectly(
			"aliexpress.trade.ds.order.get",
			{
				single_order_query: JSON.stringify({
					order_id: orderId,
				}),
			},
		);

		if (!responseData.ok) {
			throw new Error("Failed to fetch order details from the dropshipper API");
		}

		if (!responseData.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		const { aliexpress_trade_ds_order_get_response } =
			responseData.data as AliExpressOrderDetailsResponse;

		if (!aliexpress_trade_ds_order_get_response) {
			throw new NotFoundError("No order data found in the response");
		}

		const { result } = aliexpress_trade_ds_order_get_response;

		return result;
	}

	async trackOrder(vendorId: string, orderId: number) {
		console.log(`Tracking order ${orderId} for vendor ${vendorId}`);

		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const responseData = await dropShipperClient.callAPIDirectly(
			"aliexpress.ds.order.tracking.get",
			{
				ae_order_id: orderId,
				language: "en_US",
			},
		);

		if (!responseData.ok) {
			throw new Error("Failed to fetch order status from the dropshipper API");
		}

		const trackingResponse = responseData.data as AliExpressTrackingResponse;

		if (!trackingResponse) {
			throw new Error("No data returned from the dropshipper API");
		}

		console.log("Tracking Response:", trackingResponse);

		const { result } = trackingResponse;

		return result;
	}

	async calculateDeliveryFee(vendorId: string, args: ShippingInfoArgs) {
		try {
			const vendorAliexpressCreds = await DropShippingCred.findOne({
				where: { vendorId },
			});

			if (!vendorAliexpressCreds) {
				throw new NotFoundError(
					"Dropshipping credentials not found for the vendor",
				);
			}

			const dropShipperClient = this.createClient(
				vendorAliexpressCreds?.accessToken,
			);

			const queryDeliveryReq = {
				quantity: args.product_num,
				shipToCountry: args.ship_to_country_code,
				productId: args.product_id,
				provinceCode: args.ship_to_province_code,
				cityCode: args.ship_to_city_code,
				selectedSkuId: args.sku_id,
				language: "en_US",
				currency: args.price_currency || "USD",
				locale: "en_US",
			};

			const responseData = await dropShipperClient.callAPIDirectly(
				"aliexpress.ds.freight.query",
				{
					queryDeliveryReq: JSON.stringify(queryDeliveryReq),
				},
			);

			if (!responseData.ok) {
				throw new Error(
					"Failed to fetch shipping info from the dropshipper API",
				);
			}

			if (!responseData.data) {
				throw new Error("No data returned from the dropshipper API");
			}

			return responseData.data as AES_SHIPPING_INFO_RESULT;
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async getAddressSuggestions(
		vendorId: string,
		params: { language: string; countryCode: string; isMultiLanguage: boolean },
	) {
		const vendorAliexpressCreds = await DropShippingCred.findOne({
			where: { vendorId },
		});

		if (!vendorAliexpressCreds) {
			throw new NotFoundError(
				"Dropshipping credentials not found for the vendor",
			);
		}

		const dropShipperClient = this.createClient(
			vendorAliexpressCreds?.accessToken,
		);

		const response = await dropShipperClient.callAPIDirectly(
			"aliexpress.ds.address.get",
			{
				language: params.language,
				countryCode: params.countryCode,
				isMultiLanguage: params.isMultiLanguage,
			},
		);

		if (!response.ok) {
			throw new Error(
				"Failed to fetch address suggestions from the dropshipper API",
			);
		}

		if (!response.data) {
			throw new Error("No data returned from the dropshipper API");
		}

		const { aliexpress_ds_address_get_response } =
			response.data as AliExpressDsAddressGetResponse;

		if (!aliexpress_ds_address_get_response) {
			throw new NotFoundError("No address data found in the response");
		}

		console.log("Address Get Response:", aliexpress_ds_address_get_response);

		const { result } = aliexpress_ds_address_get_response;
		if (!result) {
			throw new Error("No address result found in the response");
		}

		return result.data;
	}
}

async function generateToken(code: string) {
	const apiName = "/auth/token/create";
	const signMethod = "sha256";

	// A timestamp is needed to use their API
	const timestamp = new Date().getTime();
	console.log(`Timestamp: ${timestamp}`);

	// Include the signature in your API request
	const url = "https://api-sg.aliexpress.com/rest/auth/token/create";
	const params = {
		app_key: process.env.ALIEXPRESS_APP_KEY,
		timestamp: timestamp,
		sign_method: signMethod,
		code,
	};

	// Sort all parameters and values according to the parameter name in ASCII table
	const sortedParams = Object.keys(params)
		.sort()
		.reduce((acc, key) => {
			//@ts-ignore
			acc[key] = params[key];
			return acc;
		}, {});

	//  Concatenate the sorted parameters and their values into a string
	var sortedParamsString = Object.entries(sortedParams)
		.map(([key, value]) => `${key}${value}`)
		.join("");
	sortedParamsString = apiName + sortedParamsString;

	console.log(sortedParamsString);
	// Create the signature using HMAC-SHA256
	const signature = crypto
		.createHmac(signMethod, process.env.ALIEXPRESS_APP_SECRET || "")
		.update(sortedParamsString)
		.digest("hex")
		.toUpperCase();

	// Add the signature to the parameters
	// @ts-ignore
	params["sign"] = signature;

	let data = null;
	try {
		data = (
			await axios.get(url, {
				params,
				transformRequest: [
					(data, headers) => {
						const out = typeof data === "string" ? data : JSON.stringify(data);
						console.log("final body:", out);
						console.log("final headers:", headers);
						return out;
					},
				],
			})
		).data;
		console.log(data);
	} catch (error) {
		console.log(error);
	}

	return data as AES_GENERATE_TOKEN_RESULT;
}

async function getRequest(url: string, params: any) {
	// Add the signature to the parameters
	const apiName = url.replace("https://api-sg.aliexpress.com/rest", "");

	const signMethod = "sha256";

	const sortedParams = Object.keys(params)
		.sort()
		.reduce((acc, key) => {
			//@ts-ignore
			acc[key] = params[key];
			return acc;
		}, {});

	//  Concatenate the sorted parameters and their values into a string
	var sortedParamsString = Object.entries(sortedParams)
		.map(([key, value]) => `${key}${value}`)
		.join("");
	sortedParamsString = apiName + sortedParamsString;

	console.log(sortedParamsString);
	// Create the signature using HMAC-SHA256
	const signature = crypto
		.createHmac(signMethod, process.env.ALIEXPRESS_APP_SECRET || "")
		.update(sortedParamsString)
		.digest("hex")
		.toUpperCase();

	// Add the signature to the parameters
	// @ts-ignore
	params["sign"] = signature;

	try {
		const response = await axios.get(url, { params });

		return response.data;
	} catch (error) {
		console.error("GET request error:", error);
		throw error;
	}
}
