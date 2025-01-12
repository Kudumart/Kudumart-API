"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Order.ts
const sequelize_1 = require("sequelize");
class Order extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
        });
    }
}
const initModel = (sequelize) => {
    Order.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
        totalAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        shippingAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: "pending",
        },
        refId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Order',
        timestamps: true,
        paranoid: false,
        tableName: 'orders',
    });
};
exports.initModel = initModel;
exports.default = Order;
//# sourceMappingURL=order.js.map