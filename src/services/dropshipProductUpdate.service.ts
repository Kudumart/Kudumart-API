import { DropShippingService } from "./dropShipping.service";
import { Op } from "sequelize";
import Product from "../models/product";
import DropshipProducts from "../models/dropshipProducts";
import Store from "../models/store";
import Decimal from "decimal.js";

const dropshippingService = new DropShippingService();

// Constants
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Country and currency mapping
const COUNTRY_CONFIG = {
	nigeria: { code: "NG", currency: "NGN" },
	usa: { code: "US", currency: "USD" },
	"united states": { code: "US", currency: "USD" },
	"united states of america": { code: "US", currency: "USD" },
	default: { code: "UK", currency: "USD" },
};

interface JobStats {
	totalProcessed: number;
	successCount: number;
	errorCount: number;
	deletedCount: number;
	startTime: Date;
}

/**
 * Maps store location country to shipping country code and currency
 */
function getCountryConfig(country: string): { code: string; currency: string } {
	const normalizedCountry = country.toLowerCase().trim();
	//@ts-ignore
	return COUNTRY_CONFIG[normalizedCountry] || COUNTRY_CONFIG.default;
}

/**
 * Calculates price with percentage increment
 */
function calculateIncrementedPrice(
	basePrice: string | number,
	incrementPercent: number,
): string {
	return new Decimal(basePrice)
		.mul(new Decimal(100).plus(incrementPercent))
		.div(100)
		.toFixed(2);
}

/**
 * Extracts and processes product media URLs
 */
function extractMediaUrls(productDetails: any): {
	images: string[];
	videoUrl: string | null;
} {
	const images =
		productDetails.ae_multimedia_info_dto.image_urls
			?.split(";")
			.filter((url: string) => url.trim()) || [];

	const videoUrl =
		productDetails?.ae_multimedia_info_dto?.ae_video_dtos?.[0]?.media_url ||
		null;

	return { images, videoUrl };
}

/**
 * Finds the lowest priced variant from available variants
 */
function findLowestPricedVariant(variants: any[]): any {
	if (!variants || variants.length === 0) {
		throw new Error("No variants available");
	}

	return variants.reduce((prev, curr) =>
		new Decimal(prev.offer_sale_price).lessThan(curr.offer_sale_price)
			? prev
			: curr,
	);
}

/**
 * Applies price increment to all variants
 */
function applyPriceIncrementToVariants(
	variants: any[],
	incrementPercent: number,
): any[] {
	return variants.map((variant) => ({
		...variant,
		offer_sale_price: calculateIncrementedPrice(
			variant.offer_sale_price,
			incrementPercent,
		),
	}));
}

/**
 * Retry wrapper for API calls
 */
async function retryOperation<T>(
	operation: () => Promise<T>,
	retries: number = MAX_RETRIES,
	delay: number = RETRY_DELAY_MS,
): Promise<T> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			if (attempt === retries) {
				throw error;
			}
			console.warn(
				`Attempt ${attempt} failed, retrying in ${delay}ms...`,
				// @ts-ignore
				error.message,
			);
			await new Promise((resolve) => setTimeout(resolve, delay * attempt));
		}
	}
	throw new Error("Retry operation failed");
}

/**
 * Process a single dropship product
 */
async function processDropshipProduct(
	product: any,
	stats: JobStats,
): Promise<void> {
	const productId = product.id;

	try {
		// Get country and currency configuration
		const countryConfig = getCountryConfig(product.store.location.country);

		// Fetch product details from dropshipping service with retry
		const productDetails = await retryOperation(() =>
			dropshippingService.getProductById(
				product.vendorId,
				product.dropshipDetails.dropshipProductId,
				countryConfig.code,
				// @ts-ignore
				countryConfig.currency,
			),
		);

		// Check if product is still available
		if (
			!productDetails ||
			!productDetails.ae_item_sku_info_dtos ||
			productDetails.ae_item_sku_info_dtos.length === 0
		) {
			console.warn(
				`Product ${productId} no longer available, marking for deletion`,
			);
			await Product.destroy({ where: { id: productId } });
			stats.deletedCount++;
			return;
		}

		// Find lowest priced variant
		const lowestPricedVariant = findLowestPricedVariant(
			productDetails.ae_item_sku_info_dtos,
		);

		// Extract media URLs
		const { images, videoUrl } = extractMediaUrls(productDetails);

		if (images.length === 0) {
			console.warn(`Product ${productId} has no images, skipping update`);
			stats.errorCount++;
			return;
		}

		// Calculate prices
		const incrementPercent = product.dropshipDetails.priceIncrementPercent;
		const discountPrice = calculateIncrementedPrice(
			lowestPricedVariant.offer_sale_price,
			incrementPercent,
		);

		// Apply price increment to all variants
		const variantsWithIncrementedPrices = applyPriceIncrementToVariants(
			productDetails.ae_item_sku_info_dtos,
			incrementPercent,
		);

		// Update product
		await product.update({
			name: productDetails.ae_item_base_info_dto.subject,
			description: productDetails.ae_item_base_info_dto.detail,
			specification: productDetails.ae_item_base_info_dto.mobile_detail,
			price: lowestPricedVariant.sku_price,
			discount_price: discountPrice,
			condition: "brand_new",
			quantity: lowestPricedVariant.sku_available_stock,
			image_url: images[0],
			video_url: videoUrl,
			additional_images: images,
			variants: variantsWithIncrementedPrices,
			last_synced_at: new Date(), // Track when last updated
		});

		console.log(`✓ Successfully updated product ${productId}`);
		stats.successCount++;
	} catch (error) {
		console.error(
			`✗ Error updating product ${productId}:`,
			// @ts-ignore
			error.message,
			// @ts-ignore
			error.stack,
		);
		stats.errorCount++;
		// Consider implementing a dead letter queue or error logging service here
	}
}

/**
 * Main job function to update dropship products in batches
 */
export async function updateDropshipProductsJob(): Promise<JobStats> {
	const stats: JobStats = {
		totalProcessed: 0,
		successCount: 0,
		errorCount: 0,
		deletedCount: 0,
		startTime: new Date(),
	};

	let lastProductCreatedAt: Date | null = null;
	let batchCount = 0;

	console.log("🚀 Starting dropship products update job...");

	try {
		let batch: any[];

		do {
			// Build query
			const where: any = { type: "dropship" };
			if (lastProductCreatedAt) {
				where.createdAt = { [Op.gt]: lastProductCreatedAt };
			}

			// Fetch batch
			batch = await Product.findAll({
				where,
				include: [
					{ model: DropshipProducts, as: "dropshipDetails", required: true },
					{ model: Store, as: "store", required: true },
				],
				order: [["createdAt", "ASC"]],
				limit: BATCH_SIZE,
			});

			if (batch.length === 0) {
				break;
			}

			console.log(
				`\n📦 Processing batch ${++batchCount} (${batch.length} products)...`,
			);

			// Process products in batch
			await Promise.allSettled(
				batch.map((product) => processDropshipProduct(product, stats)),
			);

			// Update cursor for next batch
			lastProductCreatedAt = batch[batch.length - 1].createdAt;
			stats.totalProcessed += batch.length;

			console.log(
				`Batch ${batchCount} complete. Total processed: ${stats.totalProcessed}`,
			);

			// Optional: Add rate limiting to avoid overwhelming the API
			if (batch.length === BATCH_SIZE) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		} while (batch.length === BATCH_SIZE);

		const duration = Date.now() - stats.startTime.getTime();
		console.log("\n✅ Job completed successfully!");
		console.log(`📊 Stats: 
    - Total Processed: ${stats.totalProcessed}
    - Successful: ${stats.successCount}
    - Errors: ${stats.errorCount}
    - Deleted: ${stats.deletedCount}
    - Duration: ${(duration / 1000).toFixed(2)}s
    `);

		return stats;
	} catch (error) {
		console.error("❌ Job failed with critical error:", error);
		throw error;
	}
}
