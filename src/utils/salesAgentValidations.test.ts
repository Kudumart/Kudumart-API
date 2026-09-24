import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSalesAgentEmail } from "./salesAgentValidations";

test("sales agent email normalization preserves plus-address aliases", () => {
	assert.equal(normalizeSalesAgentEmail(" Sodervan+Vendor@GMAIL.com "), "sodervan+vendor@gmail.com");
	assert.notEqual(normalizeSalesAgentEmail("sodervan+vendor@gmail.com"), normalizeSalesAgentEmail("sodervan@gmail.com"));
});
