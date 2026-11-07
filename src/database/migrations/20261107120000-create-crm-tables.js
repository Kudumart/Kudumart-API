"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const common = {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false },
			updatedAt: { type: Sequelize.DATE, allowNull: false },
		};
		await queryInterface.createTable("crm_campaigns", {
			...common,
			name: { type: Sequelize.STRING, allowNull: false }, code: { type: Sequelize.STRING(30), allowNull: false, unique: true }, description: Sequelize.TEXT,
			channel: { type: Sequelize.ENUM("field_reps", "referral", "event", "digital", "other"), allowNull: false, defaultValue: "field_reps" },
			status: { type: Sequelize.ENUM("draft", "active", "paused", "completed"), allowNull: false, defaultValue: "draft" },
			targetVendors: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }, budget: { type: Sequelize.DECIMAL(20, 2), allowNull: false, defaultValue: 0 },
			startsAt: { type: Sequelize.DATE, allowNull: false }, endsAt: { type: Sequelize.DATE, allowNull: false },
			createdBy: { type: Sequelize.UUID, allowNull: false, references: { model: "admins", key: "id" }, onDelete: "RESTRICT" },
		});
		await queryInterface.createTable("crm_representatives", {
			...common,
			firstName: { type: Sequelize.STRING, allowNull: false }, lastName: { type: Sequelize.STRING, allowNull: false }, email: { type: Sequelize.STRING, allowNull: false, unique: true },
			phoneNumber: Sequelize.STRING, region: Sequelize.STRING, referralCode: { type: Sequelize.STRING(30), allowNull: false, unique: true },
			status: { type: Sequelize.ENUM("active", "paused", "inactive"), allowNull: false, defaultValue: "active" }, bankInformation: Sequelize.JSON,
			createdBy: { type: Sequelize.UUID, allowNull: false, references: { model: "admins", key: "id" }, onDelete: "RESTRICT" },
		});
		await queryInterface.createTable("crm_campaign_representatives", {
			...common,
			campaignId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_campaigns", key: "id" }, onDelete: "CASCADE" },
			representativeId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_representatives", key: "id" }, onDelete: "CASCADE" },
		});
		await queryInterface.addConstraint("crm_campaign_representatives", { fields: ["campaignId", "representativeId"], type: "unique", name: "crm_campaign_representative_unique" });
		await queryInterface.createTable("crm_vendor_referrals", {
			...common,
			campaignId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_campaigns", key: "id" }, onDelete: "RESTRICT" },
			representativeId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_representatives", key: "id" }, onDelete: "RESTRICT" },
			vendorId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: "users", key: "id" }, onDelete: "RESTRICT" },
			referralCode: { type: Sequelize.STRING(30), allowNull: false }, status: { type: Sequelize.ENUM("referred", "verified", "qualified", "rejected"), allowNull: false, defaultValue: "referred" },
			referredAt: { type: Sequelize.DATE, allowNull: false }, verifiedAt: Sequelize.DATE, qualifiedAt: Sequelize.DATE,
			firstOrderId: { type: Sequelize.UUID, references: { model: "orders", key: "id" }, onDelete: "SET NULL" }, notes: Sequelize.TEXT,
		});
		await queryInterface.createTable("crm_commission_rules", {
			...common,
			campaignId: { type: Sequelize.UUID, references: { model: "crm_campaigns", key: "id" }, onDelete: "CASCADE" }, name: { type: Sequelize.STRING, allowNull: false },
			amount: { type: Sequelize.DECIMAL(20, 2), allowNull: false }, currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "NGN" },
			qualificationType: { type: Sequelize.ENUM("vendor_verified", "first_completed_order"), allowNull: false, defaultValue: "first_completed_order" },
			validationDays: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 14 }, status: { type: Sequelize.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
			createdBy: { type: Sequelize.UUID, allowNull: false, references: { model: "admins", key: "id" }, onDelete: "RESTRICT" },
		});
		await queryInterface.createTable("crm_commissions", {
			...common,
			referralId: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: "crm_vendor_referrals", key: "id" }, onDelete: "RESTRICT" },
			ruleId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_commission_rules", key: "id" }, onDelete: "RESTRICT" },
			representativeId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_representatives", key: "id" }, onDelete: "RESTRICT" },
			amount: { type: Sequelize.DECIMAL(20, 2), allowNull: false }, commissionIds: { type: Sequelize.JSON, allowNull: false }, currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "NGN" },
			status: { type: Sequelize.ENUM("pending", "qualified", "approved", "paid", "rejected"), allowNull: false, defaultValue: "pending" },
			qualifiedAt: Sequelize.DATE, approvedAt: Sequelize.DATE, approvedBy: { type: Sequelize.UUID, references: { model: "admins", key: "id" }, onDelete: "SET NULL" }, paidAt: Sequelize.DATE, notes: Sequelize.TEXT,
		});
		await queryInterface.createTable("crm_payouts", {
			...common,
			representativeId: { type: Sequelize.UUID, allowNull: false, references: { model: "crm_representatives", key: "id" }, onDelete: "RESTRICT" },
			amount: { type: Sequelize.DECIMAL(20, 2), allowNull: false }, currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: "NGN" },
			status: { type: Sequelize.ENUM("pending", "approved", "paid", "rejected"), allowNull: false, defaultValue: "pending" }, reference: { type: Sequelize.STRING, unique: true },
			approvedBy: { type: Sequelize.UUID, references: { model: "admins", key: "id" }, onDelete: "SET NULL" }, approvedAt: Sequelize.DATE, paidAt: Sequelize.DATE, notes: Sequelize.TEXT,
		});
	},
	async down(queryInterface) {
		for (const table of ["crm_payouts", "crm_commissions", "crm_commission_rules", "crm_vendor_referrals", "crm_campaign_representatives", "crm_representatives", "crm_campaigns"]) await queryInterface.dropTable(table);
	},
};
