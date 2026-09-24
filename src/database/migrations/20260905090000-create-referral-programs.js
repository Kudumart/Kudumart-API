"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("referral_programs", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING(150),
				allowNull: false,
			},
			code: {
				type: Sequelize.STRING(60),
				allowNull: false,
				unique: true,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			referrerType: {
				type: Sequelize.ENUM(
					"SALES_AGENT",
					"CUSTOMER",
					"VENDOR",
					"AFFILIATE",
					"PARTNER",
				),
				allowNull: false,
				defaultValue: "SALES_AGENT",
			},
			referredEntityType: {
				type: Sequelize.ENUM("CUSTOMER", "VENDOR", "BOTH"),
				allowNull: false,
				defaultValue: "VENDOR",
			},
			status: {
				type: Sequelize.ENUM(
					"DRAFT",
					"SCHEDULED",
					"ACTIVE",
					"PAUSED",
					"ENDED",
					"ARCHIVED",
				),
				allowNull: false,
				defaultValue: "DRAFT",
			},
			startsAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			endsAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			attributionModel: {
				type: Sequelize.ENUM(
					"FIRST_TOUCH",
					"LAST_TOUCH",
					"MANUAL_ASSIGNMENT",
					"CRM_OWNER",
					"REFERRAL_CODE_PRIORITY",
				),
				allowNull: false,
				defaultValue: "FIRST_TOUCH",
			},
			attributionWindowDays: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 60,
			},
			commissionDurationDays: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: true,
			},
			currencyMode: {
				type: Sequelize.ENUM("TRANSACTION_CURRENCY", "FIXED_PAYOUT_CURRENCY"),
				allowNull: false,
				defaultValue: "TRANSACTION_CURRENCY",
			},
			defaultPayoutCurrency: {
				type: Sequelize.STRING(3),
				allowNull: true,
			},
			minimumPayoutAmount: {
				type: Sequelize.DECIMAL(20, 2),
				allowNull: false,
				defaultValue: 0,
			},
			allowExistingUsers: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			allowSelfReferral: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			reassignmentRequiresApproval: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			termsUrl: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			createdBy: {
				type: Sequelize.UUID,
				allowNull: true,
				references: { model: "admins", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			updatedBy: {
				type: Sequelize.UUID,
				allowNull: true,
				references: { model: "admins", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
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

		await queryInterface.addIndex("referral_programs", ["status"]);
		await queryInterface.addIndex("referral_programs", ["startsAt", "endsAt"]);
	},

	async down(queryInterface) {
		await queryInterface.dropTable("referral_programs");
	},
};
