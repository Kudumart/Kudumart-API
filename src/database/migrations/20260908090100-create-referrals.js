"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("referrals", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
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
			referralCodeId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "referral_codes", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			referralVisitId: {
				type: Sequelize.UUID,
				allowNull: true,
				unique: true,
				references: { model: "referral_visits", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			referredUserId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			referredEntityType: { type: Sequelize.ENUM("CUSTOMER", "VENDOR"), allowNull: false },
			attributionMethod: {
				type: Sequelize.ENUM("REFERRAL_CODE", "FIRST_TOUCH", "LAST_TOUCH", "MANUAL_ASSIGNMENT", "CRM_OWNER"),
				allowNull: false,
				defaultValue: "REFERRAL_CODE",
			},
			status: {
				type: Sequelize.ENUM("REGISTERED", "VERIFIED", "QUALIFIED", "CONVERTED", "INACTIVE", "REJECTED", "DISQUALIFIED"),
				allowNull: false,
				defaultValue: "REGISTERED",
			},
			attributedAt: { type: Sequelize.DATE, allowNull: false },
			attributionExpiresAt: { type: Sequelize.DATE, allowNull: true },
			qualifiedAt: { type: Sequelize.DATE, allowNull: true },
			convertedAt: { type: Sequelize.DATE, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false },
			updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("referrals", ["programId", "referredUserId"], {
			unique: true,
			name: "referrals_program_user_unique",
		});
		await queryInterface.addIndex("referrals", ["agentId", "status"]);
		await queryInterface.addIndex("referrals", ["referredUserId"]);
	},
	async down(queryInterface) {
		await queryInterface.dropTable("referrals");
	},
};
