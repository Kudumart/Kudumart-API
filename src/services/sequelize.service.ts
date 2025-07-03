import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Model } from 'sequelize';

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
          port: 8889,
          dialect: (process.env.DB_DIALECT as any) || 'mysql',
          logging: false,
          define: {
            timestamps: true,
          },
        }
      );

      // Test connection
      await sequelizeService.connection.authenticate();
      console.log('Database connected successfully');

      // Load models dynamically
      const modelDirectory = path.join(__dirname, '../models');
      const modelFiles = fs
        .readdirSync(modelDirectory)
        .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

      // Make sure to adjust the order of loading if needed.
      for (const file of modelFiles) {
        const modelModule = await import(path.join(modelDirectory, file));
        const { initModel } = modelModule; // Accessing initModel correctly

        if (typeof initModel === 'function') {
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
      console.log('[SEQUELIZE] Database service initialized');
    } catch (error) {
      console.error(
        '[SEQUELIZE] Error during database service initialization',
        error
      );
      throw error;
    }
  },
};

export default sequelizeService;
