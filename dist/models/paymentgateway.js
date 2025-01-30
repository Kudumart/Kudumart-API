"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/paymentgateway.ts
const sequelize_1 = require("sequelize");
class PaymentGateway extends sequelize_1.Model {
}
const initModel = (sequelize) => {
    PaymentGateway.init({
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
        publicKey: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        secretKey: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false, // Active by default
        },
    }, {
        sequelize,
        modelName: "PaymentGateway",
        timestamps: true,
        paranoid: false,
        tableName: "payment_gateways"
    });
};
exports.initModel = initModel;
exports.default = PaymentGateway;
//# sourceMappingURL=paymentgateway.js.map