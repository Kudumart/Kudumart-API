"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/OrderItem.ts
const sequelize_1 = require("sequelize");
class Payment extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.Order, {
            as: 'order',
            foreignKey: 'orderId',
            onDelete: 'RESTRICT',
        });
    }
}
const initModel = (sequelize) => {
    Payment.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        orderId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "orders",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
        refId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        channel: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        paymentDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Payment',
        timestamps: true,
        paranoid: false,
        tableName: 'payments',
    });
};
exports.initModel = initModel;
exports.default = Payment;
//# sourceMappingURL=payment.js.map