export const getEffectiveProductPrice = (
	regularValue: string | number | null | undefined,
	discountValue: string | number | null | undefined,
): number => {
	const regularPrice = Number(regularValue ?? 0);
	const discountPrice = Number(discountValue ?? 0);

	if (
		Number.isFinite(discountPrice) &&
		discountPrice > 0 &&
		discountPrice < regularPrice
	) {
		return discountPrice;
	}

	return Number.isFinite(regularPrice) ? regularPrice : 0;
};
