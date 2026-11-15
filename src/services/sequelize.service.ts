import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Model } from "sequelize";

// Load environment variables from .env file
dotenv.config();

type ModelInstance = typeof Model & {
	associate?(models: Record<string, ModelInstance>): void;
	init(sequelize: Sequelize): void;
};

const sequelizeService = {
	connection: null as Sequelize | null,
	models: {} as Record<string, ModelInstance>,

	init: async () => {
		try {
			// Create the connection
			sequelizeService.connection = new Sequelize(
				process.env.DB_NAME!,
				process.env.DB_USER!,
				process.env.DB_PASS!,
				{
					host: process.env.DB_HOST!,
					dialect: (process.env.DB_DIALECT as any) || "mysql",
					port: Number(process.env.DB_PORT) || 3306,
					logging: false,
					define: {
						timestamps: true,
					},
				},
			);

			// Test connection
			await sequelizeService.connection.authenticate();
			console.log("Database connected successfully");

			// Load models dynamically
			const modelDirectory = path.join(__dirname, "../models");
			const modelFiles = fs
				.readdirSync(modelDirectory)
				.filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

			// Make sure to adjust the order of loading if needed.
			for (const file of modelFiles) {
				const modelModule = await import(path.join(modelDirectory, file));
				const { initModel } = modelModule; // Accessing initModel correctly

				if (typeof initModel === "function") {
					initModel(sequelizeService.connection); // Initialize the model

					const modelName = modelModule.default.name; // Get the class name directly
					sequelizeService.models[modelName] = modelModule.default; // Store the model
					console.log(`Model ${modelName} initialized`);
				} else {
					console.error(`Model init function is missing for ${file}`);
				}
			}

			// Set up associations
			for (const modelName in sequelizeService.models) {
				const model = sequelizeService.models[modelName];
				if (model.associate) {
					model.associate(sequelizeService.models);
				}
			}

			// Sync the models with the database
			await sequelizeService.connection.sync({ force: false });

			// Ensure foreign key constraint on installment_plans.vendorId is dropped
			// so products listed by Admin (admins table) or dropship suppliers can be purchased on Layaway
			try {
				await sequelizeService.connection.query(`
					SET @fk_name = (
						SELECT CONSTRAINT_NAME
						FROM information_schema.KEY_COLUMN_USAGE
						WHERE TABLE_SCHEMA = DATABASE()
							AND TABLE_NAME = 'installment_plans'
							AND COLUMN_NAME = 'vendorId'
							AND REFERENCED_TABLE_NAME IS NOT NULL
						LIMIT 1
					);
					SET @sql = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE installment_plans DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
					PREPARE stmt FROM @sql;
					EXECUTE stmt;
					DEALLOCATE PREPARE stmt;
				`);
				await sequelizeService.connection.query(`
					ALTER TABLE installment_plans MODIFY COLUMN vendorId CHAR(36) NULL;
				`);
			} catch (_fkErr) {
				// Non-fatal if table does not exist yet or already altered
			}

			console.log("[SEQUELIZE] Database service initialized");
		} catch (error) {
			console.error(
				"[SEQUELIZE] Error during database service initialization",
				error,
			);
			throw error;
		}
	},
};

export default sequelizeService;
