"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: 8889,
    dialect: 'mysql',
    logging: false,
    timezone: '+00:00',
});
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map