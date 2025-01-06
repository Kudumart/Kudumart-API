"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Currency.ts
const sequelize_1 = require("sequelize");
class Currency extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
    }
}
const initModel = (sequelize) => {
    Currency.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        symbol: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Currency',
        timestamps: true,
        paranoid: false,
        tableName: 'currencies',
    });
};
exports.initModel = initModel;
exports.default = Currency;
//# sourceMappingURL=currency.js.map