"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("referral_codes", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
				primaryKey: true,
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
			code: {
				type: Sequelize.STRING(80),
				allowNull: false,
				unique: true,
			},
			destinationUrl: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			campaignCode: {
				type: Sequelize.STRING(80),
				allowNull: true,
			},
			channel: {
				type: Sequelize.ENUM(
					"WHATSAPP",
					"EMAIL",
					"PHONE",
					"FIELD_SALES",
					"SOCIAL_MEDIA",
					"EVENT",
					"WEBSITE",
					"OTHER",
				),
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM("ACTIVE", "PAUSED", "REVOKED", "EXPIRED"),
				allowNull: false,
				defaultValue: "ACTIVE",
			},
			maximumUses: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: true,
			},
			usageCount: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 0,
			},
			expiresAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			revokedAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});

		await queryInterface.addIndex("referral_codes", ["programId", "agentId"]);
		await queryInterface.addIndex("referral_codes", ["status", "expiresAt"]);
		await queryInterface.addIndex("referral_codes", ["campaignCode"]);
	},

	async down(queryInterface) {
		await queryInterface.dropTable("referral_codes");
	},
};
