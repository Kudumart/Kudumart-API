"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("crm_leads", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
			ownerAgentId: { type: Sequelize.UUID, allowNull: false, references: { model: "sales_agents", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			firstName: { type: Sequelize.STRING(100), allowNull: false }, lastName: { type: Sequelize.STRING(100), allowNull: false },
			email: { type: Sequelize.STRING(191), allowNull: true }, phoneNumber: { type: Sequelize.STRING(40), allowNull: true },
			entityType: { type: Sequelize.ENUM("CUSTOMER", "VENDOR"), allowNull: false },
			stage: { type: Sequelize.ENUM("NEW", "CONTACTED", "QUALIFIED", "ONBOARDING", "WON", "LOST"), allowNull: false, defaultValue: "NEW" },
			source: { type: Sequelize.STRING(80), allowNull: true },
			referralCodeId: { type: Sequelize.UUID, allowNull: true, references: { model: "referral_codes", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
			referredUserId: { type: Sequelize.UUID, allowNull: true, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
			nextFollowUpAt: { type: Sequelize.DATE, allowNull: true }, expectedValue: { type: Sequelize.DECIMAL(20, 2), allowNull: true }, currency: { type: Sequelize.STRING(3), allowNull: true }, lostReason: { type: Sequelize.TEXT, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("crm_leads", ["ownerAgentId", "stage"]);
		await queryInterface.addIndex("crm_leads", ["nextFollowUpAt"]);
		await queryInterface.createTable("crm_activities", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
			leadId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_leads", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
			createdByAdminId: { type: Sequelize.UUID, allowNull: true, references: { model: "admins", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
			type: { type: Sequelize.ENUM("NOTE", "CALL", "EMAIL", "MEETING", "TASK", "STAGE_CHANGE"), allowNull: false },
			subject: { type: Sequelize.STRING(191), allowNull: false }, details: { type: Sequelize.TEXT, allowNull: true }, dueAt: { type: Sequelize.DATE, allowNull: true }, completedAt: { type: Sequelize.DATE, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("crm_activities", ["leadId", "createdAt"]);
		await queryInterface.addIndex("crm_activities", ["type", "dueAt", "completedAt"]);
	},
	async down(queryInterface) { await queryInterface.dropTable("crm_activities"); await queryInterface.dropTable("crm_leads"); },
};
