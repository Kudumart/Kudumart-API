"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("commission_payouts", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
			agentId: { type: Sequelize.UUID, allowNull: false, references: { model: "sales_agents", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			currency: { type: Sequelize.STRING(3), allowNull: false },
			totalAmount: { type: Sequelize.DECIMAL(20, 2), allowNull: false },
			earningCount: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
			status: { type: Sequelize.ENUM("DRAFT", "APPROVED", "PROCESSING", "PAID", "FAILED", "CANCELLED"), allowNull: false, defaultValue: "DRAFT" },
			approvedBy: { type: Sequelize.UUID, allowNull: true, references: { model: "admins", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
			approvedAt: { type: Sequelize.DATE, allowNull: true },
			paidAt: { type: Sequelize.DATE, allowNull: true },
			paymentReference: { type: Sequelize.STRING(191), allowNull: true, unique: true },
			failureReason: { type: Sequelize.TEXT, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false },
			updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("commission_payouts", ["agentId", "currency", "status"]);
		await queryInterface.addColumn("commission_earnings", "payoutBatchId", {
			type: Sequelize.UUID,
			allowNull: true,
			references: { model: "commission_payouts", key: "id" },
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
			after: "ruleId",
		});
		await queryInterface.addIndex("commission_earnings", ["payoutBatchId"]);
	},

	async down(queryInterface) {
		await queryInterface.removeColumn("commission_earnings", "payoutBatchId");
		await queryInterface.dropTable("commission_payouts");
	},
};
