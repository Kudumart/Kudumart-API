"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config();
const sequelizeService = {
    connection: null,
    models: {},
    init: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Create the connection
            sequelizeService.connection = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
                host: process.env.DB_HOST,
                dialect: process.env.DB_DIALECT,
                logging: false,
                define: {
                    timestamps: true,
                },
            });
            // Test connection
            yield sequelizeService.connection.authenticate();
            console.log("Database connected successfully");
            // Load models dynamically
            const modelDirectory = path_1.default.join(__dirname, '../models');
            const modelFiles = fs_1.default.readdirSync(modelDirectory).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
            // Make sure to adjust the order of loading if needed.
            for (const file of modelFiles) {
                const modelModule = yield Promise.resolve(`${path_1.default.join(modelDirectory, file)}`).then(s => __importStar(require(s)));
                const { initModel } = modelModule; // Accessing initModel correctly
                if (typeof initModel === 'function') {
                    initModel(sequelizeService.connection); // Initialize the model
                    const modelName = modelModule.default.name; // Get the class name directly
                    sequelizeService.models[modelName] = modelModule.default; // Store the model
                    console.log(`Model ${modelName} initialized`);
                }
                else {
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
            yield sequelizeService.connection.sync({ force: false });
            console.log('[SEQUELIZE] Database service initialized');
        }
        catch (error) {
            console.error('[SEQUELIZE] Error during database service initialization', error);
            throw error;
        }
    }),
};
exports.default = sequelizeService;
//# sourceMappingURL=sequelize.service.js.map