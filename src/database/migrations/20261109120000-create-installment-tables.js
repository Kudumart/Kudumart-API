"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// 1. installment_configs
		await queryInterface.createTable("installment_configs", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			system_mode: {
				type: Sequelize.ENUM("disabled", "layaway_only", "bnpl_only", "hybrid"),
				allowNull: false,
				defaultValue: "layaway_only",
			},
			fulfillment_trigger: {
				type: Sequelize.ENUM("on_completion", "on_deposit"),
				allowNull: false,
				defaultValue: "on_completion",
			},
			min_order_amount: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
				defaultValue: 25000.0,
			},
			max_order_amount: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
				defaultValue: 2000000.0,
			},
			min_deposit_percentage: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 25,
			},
			allowed_tenures: {
				type: Sequelize.JSON,
				allowNull: false,
			},
			financing_fee_percentage: {
				type: Sequelize.DECIMAL(5, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
			grace_period_days: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 5,
			},
			cancellation_fee_percentage: {
				type: Sequelize.DECIMAL(5, 2),
				allowNull: false,
				defaultValue: 8.0,
			},
			vendor_split_percentage: {
				type: Sequelize.DECIMAL(5, 2),
				allowNull: false,
				defaultValue: 50.0,
			},
			refund_to_wallet: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			eligible_categories: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			vendor_restriction: {
				type: Sequelize.ENUM("all_vendors", "verified_only"),
				allowNull: false,
				defaultValue: "all_vendors",
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
		});

		// 2. installment_plans
		await queryInterface.createTable("installment_plans", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			productId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "products",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			variantId: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			vendorId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			storeId: {
				type: Sequelize.UUID,
				allowNull: true,
			},
			mode: {
				type: Sequelize.ENUM("layaway", "bnpl"),
				allowNull: false,
				defaultValue: "layaway",
			},
			fulfillment_trigger: {
				type: Sequelize.ENUM("on_completion", "on_deposit"),
				allowNull: false,
				defaultValue: "on_completion",
			},
			productPrice: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
			},
			shippingFee: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
			financingFee: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
			totalAmount: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
			},
			depositAmount: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
			},
			remainingBalance: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
			},
			numberOfInstallments: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 3,
			},
			tenureDays: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 60,
			},
			status: {
				type: Sequelize.ENUM("active", "completed", "defaulted", "cancelled"),
				allowNull: false,
				defaultValue: "active",
			},
			shippingAddress: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			orderId: {
				type: Sequelize.UUID,
				allowNull: true,
			},
			reservedUntil: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			completedAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			defaultedAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
		});

		// 3. installment_milestones
		await queryInterface.createTable("installment_milestones", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			planId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "installment_plans",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			installmentNumber: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			amount: {
				type: Sequelize.DECIMAL(12, 2),
				allowNull: false,
			},
			dueDate: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			paidAt: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM("pending", "paid", "overdue", "cancelled"),
				allowNull: false,
				defaultValue: "pending",
			},
			paymentReference: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			gateway: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			paymentMethod: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn("NOW"),
			},
		});

		// Indexes
		await queryInterface.addIndex("installment_plans", ["userId"]);
		await queryInterface.addIndex("installment_plans", ["productId"]);
		await queryInterface.addIndex("installment_plans", ["status"]);
		await queryInterface.addIndex("installment_milestones", ["planId"]);
		await queryInterface.addIndex("installment_milestones", ["status"]);
	},

	async down(queryInterface) {
		await queryInterface.dropTable("installment_milestones");
		await queryInterface.dropTable("installment_plans");
		await queryInterface.dropTable("installment_configs");
	},
};
