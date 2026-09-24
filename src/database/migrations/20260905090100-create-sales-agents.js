"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("sales_agents", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: true,
				unique: true,
				references: { model: "users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			managerId: {
				type: Sequelize.UUID,
				allowNull: true,
				references: { model: "sales_agents", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			employeeReference: {
				type: Sequelize.STRING(80),
				allowNull: true,
				unique: true,
			},
			agentCode: {
				type: Sequelize.STRING(40),
				allowNull: false,
				unique: true,
			},
			firstName: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			lastName: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING(191),
				allowNull: false,
				unique: true,
			},
			phoneNumber: {
				type: Sequelize.STRING(40),
				allowNull: true,
			},
			agentType: {
				type: Sequelize.ENUM(
					"INTERNAL_SALES",
					"CONTRACTOR",
					"AFFILIATE",
					"INFLUENCER",
					"PARTNER",
				),
				allowNull: false,
				defaultValue: "INTERNAL_SALES",
			},
			status: {
				type: Sequelize.ENUM("INVITED", "ACTIVE", "SUSPENDED", "TERMINATED"),
				allowNull: false,
				defaultValue: "INVITED",
			},
			crmUserId: {
				type: Sequelize.STRING(191),
				allowNull: true,
			},
			joinedAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			suspendedAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			terminatedAt: {
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

		await queryInterface.addIndex("sales_agents", ["status"]);
		await queryInterface.addIndex("sales_agents", ["managerId"]);
		await queryInterface.addIndex("sales_agents", ["crmUserId"]);
	},

	async down(queryInterface) {
		await queryInterface.dropTable("sales_agents");
	},
};
