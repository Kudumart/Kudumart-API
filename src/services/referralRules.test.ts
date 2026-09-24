import test from "node:test";
import assert from "node:assert/strict";
import { calculateCommissionAmount } from "./commissionEngine.service";
import { compareQualificationValue } from "./referralQualification.service";

test("qualification operators compare boundary values correctly", () => {
	assert.equal(compareQualificationValue(3, "GREATER_THAN_OR_EQUAL", 3), true);
	assert.equal(compareQualificationValue(3, "GREATER_THAN", 3), false);
	assert.equal(compareQualificationValue(3, "LESS_THAN_OR_EQUAL", 3), true);
	assert.equal(compareQualificationValue(3, "LESS_THAN", 3), false);
	assert.equal(compareQualificationValue(3, "EQUALS", 3), true);
});

test("percentage commissions round money to two decimal places", () => {
	const amount = calculateCommissionAmount(99.99, { calculationType: "PERCENTAGE", rate: 7.5 });
	assert.equal(amount.toFixed(2), "7.50");
});

test("commission cap limits percentage earnings", () => {
	const amount = calculateCommissionAmount(10000, { calculationType: "PERCENTAGE", rate: 10, maximumCommissionAmount: 250 });
	assert.equal(amount.toFixed(2), "250.00");
});

test("fixed commission is independent of source amount", () => {
	const amount = calculateCommissionAmount(1, { calculationType: "FIXED", rate: 500 });
	assert.equal(amount.toFixed(2), "500.00");
});
