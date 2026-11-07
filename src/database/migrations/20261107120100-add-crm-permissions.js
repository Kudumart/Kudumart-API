"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
	async up(queryInterface) {
		const now = new Date();
		await queryInterface.bulkInsert("permissions", [
			{ id: uuidv4(), name: "view-crm", description: "View CRM campaigns, representatives, referrals and earnings", createdAt: now, updatedAt: now },
			{ id: uuidv4(), name: "manage-crm", description: "Manage CRM campaigns, representatives, referrals, commissions and payouts", createdAt: now, updatedAt: now },
		]);
	},
	async down(queryInterface) {
		await queryInterface.bulkDelete("permissions", { name: ["view-crm", "manage-crm"] });
	},
};
