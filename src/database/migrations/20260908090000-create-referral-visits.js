"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("referral_visits", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
			referralCodeId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "referral_codes", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			programId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "referral_programs", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			agentId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "sales_agents", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			visitorToken: { type: Sequelize.STRING(64), allowNull: false, unique: true },
			ipHash: { type: Sequelize.STRING(64), allowNull: true },
			userAgentHash: { type: Sequelize.STRING(64), allowNull: true },
			landingUrl: { type: Sequelize.TEXT, allowNull: true },
			referrerUrl: { type: Sequelize.TEXT, allowNull: true },
			campaignCode: { type: Sequelize.STRING(80), allowNull: true },
			channel: { type: Sequelize.STRING(40), allowNull: true },
			expiresAt: { type: Sequelize.DATE, allowNull: false },
			convertedAt: { type: Sequelize.DATE, allowNull: true },
			referredUserId: {
				type: Sequelize.UUID,
				allowNull: true,
				references: { model: "users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			createdAt: { type: Sequelize.DATE, allowNull: false },
			updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("referral_visits", ["referralCodeId", "createdAt"]);
		await queryInterface.addIndex("referral_visits", ["programId", "agentId"]);
		await queryInterface.addIndex("referral_visits", ["expiresAt", "convertedAt"]);
	},
	async down(queryInterface) {
		await queryInterface.dropTable("referral_visits");
	},
};
