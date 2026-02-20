"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// 1) attribute_definitions (AttributeDefinitions)
		await queryInterface.createTable("attribute_definitions", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			input_type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			data_type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		});
		await queryInterface.addIndex("attribute_definitions", ["name"], {
			unique: true,
			name: "attribute_name_unique",
		});

		// 2) attribute_options
		await queryInterface.createTable("attribute_options", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			option_value: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		});

		// 3) services
		await queryInterface.createTable("services", {
			id: {
				type: Sequelize.UUID,
				allowNull: false,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			image_url: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			video_url: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			vendorId: {
				type: Sequelize.UUID,
				allowNull: false,
				// reference to users table - adjust table name if your users table differs
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			service_category_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			service_subcategory_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			location_city: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			location_state: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			location_country: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			work_experience_years: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			is_negotiable: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			additional_images: {
				type: Sequelize.JSON,
				allowNull: true,
				defaultValue: [],
			},
			price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false,
			},
			discount_price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM("active", "inactive", "suspended"),
				allowNull: false,
				defaultValue: "inactive",
			},
			attributes: {
				type: Sequelize.JSON,
				allowNull: true,
				defaultValue: [],
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// 4) attribute_bool_values
		await queryInterface.createTable("attribute_bool_values", {
			id: {
				type: Sequelize.UUID,
				allowNull: false,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			service_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "services",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			value: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
		});
		await queryInterface.addIndex(
			"attribute_bool_values",
			["service_id", "attribute_id"],
			{
				unique: true,
				name: "unique_service_attribute_bool_value",
			},
		);

		// 5) service_attribute_number_values
		await queryInterface.createTable("attribute_number_values", {
			id: {
				type: Sequelize.UUID,
				allowNull: false,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			service_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "services",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			value: {
				type: Sequelize.FLOAT,
				allowNull: false,
			},
		});
		await queryInterface.addIndex(
			"attribute_number_values",
			["service_id", "attribute_id"],
			{
				unique: true,
				name: "unique_attribute_number_value",
			},
		);

		// 6) attribute_option_values
		await queryInterface.createTable("attribute_option_values", {
			id: {
				type: Sequelize.UUID,
				allowNull: false,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			service_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "services",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			option_value_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_options",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
		});
		await queryInterface.addIndex(
			"attribute_option_values",
			["service_id", "attribute_id", "option_value_id"],
			{
				unique: true,
				name: "unique_attribute_option",
			},
		);

		// 7) attribute_text_values
		await queryInterface.createTable("attribute_text_values", {
			id: {
				type: Sequelize.UUID,
				allowNull: false,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			service_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "services",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			text_value: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
		});
		await queryInterface.addIndex(
			"attribute_text_values",
			["service_id", "attribute_id"],
			{
				unique: true,
				name: "unique_attribute_text_value",
			},
		);

		// 8) attribute_category_map (ServiceCategoryToAttributeMap)
		await queryInterface.createTable("attribute_category_map", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			service_category_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "service_categories",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
				onDelete: "CASCADE",
				onUpdate: "CASCADE",
			},
		});
		await queryInterface.addIndex(
			"attribute_category_map",
			["service_category_id", "attribute_id"],
			{
				unique: true,
				name: "unique_attribute_category_map",
			},
		);
	},

	async down(queryInterface, Sequelize) {
		// Drop in reverse order
		await queryInterface.dropTable("attribute_category_map");
		await queryInterface.dropTable("attribute_text_values");
		await queryInterface.dropTable("attribute_option_values");
		await queryInterface.dropTable("attribute_number_values");
		await queryInterface.dropTable("attribute_bool_values");
		await queryInterface.dropTable("services");
		await queryInterface.dropTable("attribute_options");
		await queryInterface.dropTable("attribute_definitions");
	},
};
