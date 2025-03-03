"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Withdrawal.ts
const sequelize_1 = require("sequelize");
class Withdrawal extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'vendorId', // Ensure the Withdrawal model has a 'vendorId' column
        });
    }
}
const initModel = (sequelize) => {
    Withdrawal.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        vendorId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        bankInformation: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: [], // Ensures it's an array by default
            get() {
                const value = this.getDataValue('bankInformation');
                return typeof value === 'string' ? JSON.parse(value) : value;
            }
        },
        amount: {
            type: sequelize_1.DataTypes.DECIMAL(20, 2),
            allowNull: false,
        },
        currency: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: "pending", // Values: pending, approved, rejected
        },
        note: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        paymentReceipt: {
            type: sequelize_1.DataTypes.TEXT, // Store file path or URL
            allowNull: true, // Optional field
        },
    }, {
        sequelize,
        modelName: "Withdrawal",
        timestamps: true,
        paranoid: false,
        tableName: "withdrawals"
    });
};
exports.initModel = initModel;
exports.default = Withdrawal;
//# sourceMappingURL=withdrawal.js.map