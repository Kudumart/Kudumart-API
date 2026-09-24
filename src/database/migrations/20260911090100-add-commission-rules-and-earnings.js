"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("referral_programs", "commissionRules", {
			type: Sequelize.JSON,
			allowNull: true,
			after: "qualificationRules",
		});
		await queryInterface.sequelize.query("UPDATE referral_programs SET commissionRules = JSON_ARRAY() WHERE commissionRules IS NULL");
		await queryInterface.changeColumn("referral_programs", "commissionRules", { type: Sequelize.JSON, allowNull: false });

		await queryInterface.createTable("commission_earnings", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
			referralId: { type: Sequelize.UUID, allowNull: false, references: { model: "referrals", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			programId: { type: Sequelize.UUID, allowNull: false, references: { model: "referral_programs", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			agentId: { type: Sequelize.UUID, allowNull: false, references: { model: "sales_agents", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			ruleId: { type: Sequelize.STRING(60), allowNull: false },
			sourceType: { type: Sequelize.ENUM("ORDER", "ORDER_ITEM"), allowNull: false },
			sourceId: { type: Sequelize.UUID, allowNull: false },
			baseAmount: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
			amount: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
			currency: { type: Sequelize.STRING(3), allowNull: false },
			status: { type: Sequelize.ENUM("PENDING", "AVAILABLE", "PAID", "REVERSED", "CANCELLED"), allowNull: false, defaultValue: "PENDING" },
			earnedAt: { type: Sequelize.DATE, allowNull: false },
			heldUntil: { type: Sequelize.DATE, allowNull: false },
			availableAt: { type: Sequelize.DATE, allowNull: true },
			paidAt: { type: Sequelize.DATE, allowNull: true },
			reversedAt: { type: Sequelize.DATE, allowNull: true },
			calculationSnapshot: { type: Sequelize.JSON, allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false },
			updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("commission_earnings", ["referralId", "ruleId", "sourceType", "sourceId"], { unique: true, name: "commission_earnings_source_rule_unique" });
		await queryInterface.addIndex("commission_earnings", ["agentId", "status", "heldUntil"]);
	},

	async down(queryInterface) {
		await queryInterface.dropTable("commission_earnings");
		await queryInterface.removeColumn("referral_programs", "commissionRules");
	},
};
