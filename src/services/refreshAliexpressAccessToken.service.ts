import { DropShippingService } from "./dropShipping.service";
import logger from "../middlewares/logger";
import { Op } from "sequelize";
import DropShippingCred from "../models/dropshippngCreds";

const dropshippingService = new DropShippingService();

// Constants
const TOKEN_REFRESH_THRESHOLD_HOURS = 12; // Refresh if token expires in less than 12 hours

interface RefreshStats {
	totalChecked: number;
	successCount: number;
	errorCount: number;
	skippedCount: number;
	startTime: Date;
}

/**
 * Refresh dropshipping credentials for a single vendor
 */
async function refreshVendorCredentials(
	vendorCred: any,
	stats: RefreshStats,
): Promise<void> {
	const vendorId = vendorCred.vendorId;

	try {
		const now = Date.now();
		const refreshTokenExpiry = vendorCred.refreshTokenValidTime;

		// Check if refresh token is still valid
		if (refreshTokenExpiry <= now) {
			logger.warn(
				`Refresh token expired for vendor ${vendorId}. Manual reconnection required.`,
			);
			stats.skippedCount++;
			return;
		}

		// Check if access token needs refresh (expires in less than threshold)
		const accessTokenExpiry = vendorCred.expireTime;
		const hoursUntilExpiry = (accessTokenExpiry - now) / 1000 / 60 / 60;

		if (hoursUntilExpiry > TOKEN_REFRESH_THRESHOLD_HOURS) {
			logger.info(
				`Access token for vendor ${vendorId} still valid for ${hoursUntilExpiry.toFixed(2)} hours. Skipping refresh. `,
			);
			stats.skippedCount++;
			return;
		}

		logger.info(`Refreshing access token for vendor ${vendorId}...`);

		// Call the refresh token method
		const refreshedTokenData = await dropshippingService.refreshAccessToken(
			vendorId,
			vendorCred.refreshToken,
		);

		// Update the credentials in database
		await vendorCred.update({
			accessToken: refreshedTokenData.accessToken,
			refreshToken: refreshedTokenData.refreshToken,
			expiresIn: refreshedTokenData.expiresIn,
			expireTime: refreshedTokenData.expireTime,
			refreshExpiresIn: refreshedTokenData.refreshExpiresIn,
			refreshTokenValidTime: refreshedTokenData.refreshTokenValidTime,
			userNick: refreshedTokenData.userNick,
			locale: refreshedTokenData.locale,
			account: refreshedTokenData.account,
			accountId: refreshedTokenData.accountId,
			accountPlatform: refreshedTokenData.accountPlatform,
			sellerId: refreshedTokenData.sellerId,
		});

		logger.info(`✓ Successfully refreshed credentials for vendor ${vendorId}`);
		stats.successCount++;
	} catch (error: any) {
		logger.error(
			`✗ Error refreshing credentials for vendor ${vendorId}: ${error.message}`,
		);
		stats.errorCount++;
	}
}

/**
 * Main job function to refresh all dropshipping credentials
 */
export async function refreshDropshippingCredsJob(): Promise<RefreshStats> {
	const stats: RefreshStats = {
		totalChecked: 0,
		successCount: 0,
		errorCount: 0,
		skippedCount: 0,
		startTime: new Date(),
	};

	logger.info("🔄 Starting dropshipping credentials refresh job...");

	try {
		const now = Date.now();
		const thresholdTime = now + TOKEN_REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000;

		// Find all vendors whose access tokens are expiring soon or already expired
		// but refresh tokens are still valid
		const vendorCredsToRefresh = await DropShippingCred.findAll({
			where: {
				// Access token expires soon
				expireTime: {
					[Op.lt]: thresholdTime,
				},
				// But refresh token is still valid
				refreshTokenValidTime: {
					[Op.gt]: now,
				},
			},
		});

		stats.totalChecked = vendorCredsToRefresh.length;

		if (vendorCredsToRefresh.length === 0) {
			logger.info("No credentials need refreshing at this time.");
			return stats;
		}

		logger.info(
			`Found ${vendorCredsToRefresh.length} vendor(s) with credentials needing refresh`,
		);

		// Refresh credentials for each vendor
		for (const vendorCred of vendorCredsToRefresh) {
			await refreshVendorCredentials(vendorCred, stats);

			// Add small delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		const duration = Date.now() - stats.startTime.getTime();
		logger.info("\n✅ Credentials refresh job completed!");
		logger.info(`📊 Stats: 
    - Total Checked: ${stats.totalChecked}
    - Successfully Refreshed: ${stats.successCount}
    - Errors: ${stats.errorCount}
    - Skipped: ${stats.skippedCount}
    - Duration: ${(duration / 1000).toFixed(2)}s
    `);

		return stats;
	} catch (error: any) {
		logger.error(
			"❌ Credentials refresh job failed with critical error:",
			error,
		);
		throw error;
	}
}

/**
 * Manually refresh credentials for a specific vendor
 * Can be called from an API endpoint
 */
export async function refreshVendorCredsManually(
	vendorId: string,
): Promise<void> {
	logger.info(`Manual refresh triggered for vendor ${vendorId}`);

	const vendorCred = await DropShippingCred.findOne({
		where: { vendorId },
	});

	if (!vendorCred) {
		throw new Error(`No credentials found for vendor ${vendorId}`);
	}

	const stats: RefreshStats = {
		totalChecked: 1,
		successCount: 0,
		errorCount: 0,
		skippedCount: 0,
		startTime: new Date(),
	};

	await refreshVendorCredentials(vendorCred, stats);

	if (stats.errorCount > 0) {
		throw new Error(`Failed to refresh credentials for vendor ${vendorId}`);
	}
}
