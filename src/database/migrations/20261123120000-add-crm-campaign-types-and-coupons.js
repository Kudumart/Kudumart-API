"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const existingTables = new Set(
			(await queryInterface.showAllTables()).map((table) =>
				typeof table === "string" ? table : table.tableName,
			),
		);

		if (existingTables.has("crm_campaigns")) {
			const cols = await queryInterface.describeTable("crm_campaigns");
			if (!cols.campaignType) {
				await queryInterface.addColumn("crm_campaigns", "campaignType", {
					type: Sequelize.ENUM("vendor_acquisition", "market_campaign", "vendor_promo"),
					allowNull: false,
					defaultValue: "vendor_acquisition",
				});
			}
			if (!cols.marketName) {
				await queryInterface.addColumn("crm_campaigns", "marketName", {
					type: Sequelize.STRING,
					allowNull: true,
				});
			}
			if (!cols.marketLocation) {
				await queryInterface.addColumn("crm_campaigns", "marketLocation", {
					type: Sequelize.STRING,
					allowNull: true,
				});
			}
			if (!cols.vendorId) {
				await queryInterface.addColumn("crm_campaigns", "vendorId", {
					type: Sequelize.UUID,
					allowNull: true,
					references: { model: "users", key: "id" },
					onDelete: "SET NULL",
				});
			}
		}

		if (!existingTables.has("crm_coupons")) {
			await queryInterface.createTable("crm_coupons", {
				id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
				code: { type: Sequelize.STRING(40), allowNull: false, unique: true },
				name: { type: Sequelize.STRING, allowNull: false },
				description: Sequelize.TEXT,
				discountType: { type: Sequelize.ENUM("percentage", "fixed"), allowNull: false, defaultValue: "percentage" },
				discountValue: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
				currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "NGN" },
				minOrderAmount: { type: Sequelize.DECIMAL(20, 2), allowNull: false, defaultValue: 0 },
				maxDiscountAmount: { type: Sequelize.DECIMAL(20, 2), allowNull: true },
				usageLimit: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
				usageCount: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
				perUserLimit: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
				scope: { type: Sequelize.ENUM("all", "market", "vendor"), allowNull: false, defaultValue: "all" },
				marketName: { type: Sequelize.STRING, allowNull: true },
				vendorId: {
					type: Sequelize.UUID,
					allowNull: true,
					references: { model: "users", key: "id" },
					onDelete: "SET NULL",
				},
				campaignId: {
					type: Sequelize.UUID,
					allowNull: true,
					references: { model: "crm_campaigns", key: "id" },
					onDelete: "SET NULL",
				},
				status: { type: Sequelize.ENUM("draft", "active", "paused", "expired"), allowNull: false, defaultValue: "active" },
				startsAt: { type: Sequelize.DATE, allowNull: false },
				endsAt: { type: Sequelize.DATE, allowNull: false },
				createdBy: {
					type: Sequelize.UUID,
					allowNull: false,
					references: { model: "admins", key: "id" },
					onDelete: "RESTRICT",
				},
				createdAt: { type: Sequelize.DATE, allowNull: false },
				updatedAt: { type: Sequelize.DATE, allowNull: false },
			});
		}
	},

	async down(queryInterface) {
		const existingTables = new Set(
			(await queryInterface.showAllTables()).map((table) =>
				typeof table === "string" ? table : table.tableName,
			),
		);
		if (existingTables.has("crm_coupons")) {
			await queryInterface.dropTable("crm_coupons");
		}
		if (existingTables.has("crm_campaigns")) {
			const cols = await queryInterface.describeTable("crm_campaigns");
			for (const col of ["vendorId", "marketLocation", "marketName", "campaignType"]) {
				if (cols[col]) await queryInterface.removeColumn("crm_campaigns", col);
			}
		}
	},
};
