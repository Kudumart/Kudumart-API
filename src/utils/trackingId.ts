import crypto from "crypto";

/**
 * Generate a hash-based tracking ID from vendor UUID
 * vendorUuid - The existing vendor UUID
 * prefix - Optional prefix (default: 'KM')
 * hashLength - Length of hash portion (default: 6)
 returns  Hash-based tracking ID (e.g., 'KM-A1B2C3D8')
 */
export function generateVendorTrackingId(
	vendorUuid: string,
	prefix: string = "KDM-VEN",
	hashLength: number = 8,
) {
	// Create SHA-256 hash from the UUID
	const hash = crypto.createHash("sha256").update(vendorUuid).digest("hex");

	// Take first N characters and convert to uppercase
	const shortHash = hash.substring(0, hashLength).toUpperCase();

	// Return formatted tracking ID
	return `${prefix}-${shortHash}`;
}
