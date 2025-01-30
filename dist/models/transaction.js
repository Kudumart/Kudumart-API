"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/transaction.ts
const sequelize_1 = require("sequelize");
class Transaction extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId', // Ensure the Transaction model has a 'userId' column
        });
    }
}
const initModel = (sequelize) => {
    Transaction.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        amount: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
        },
        transactionType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        refId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Transaction",
        timestamps: true,
        paranoid: false,
        tableName: "transactions"
    });
};
exports.initModel = initModel;
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map