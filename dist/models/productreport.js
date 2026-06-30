"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
const sequelize_1 = require("sequelize");
class ProductReport extends sequelize_1.Model {
}
const initModel = (sequelize) => {
    ProductReport.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        productId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        reason: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'ProductReport',
        tableName: 'ProductReports',
    });
};
exports.initModel = initModel;
exports.default = ProductReport;
//# sourceMappingURL=productreport.js.map