"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Order.ts
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
class Order extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
        });
        this.hasMany(models.OrderItem, {
            as: 'orderItems',
            foreignKey: 'orderId'
        });
        this.hasOne(models.Payment, {
            as: 'payment',
            foreignKey: 'orderId'
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
        trackingNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        totalAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        shippingAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        refId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        deliveryCode: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Order',
        timestamps: true,
        paranoid: false,
        tableName: 'orders',
    });
    // Add hooks
    Order.addHook('beforeCreate', (order) => {
        const appName = process.env.APP_NAME || "APP"; // Use app name from environment variable or fallback
        const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format: yyyyMMdd
        const randomSuffix = (0, crypto_1.randomBytes)(3).toString('hex'); // Generate random string
        // Generate tracking number
        order.trackingNumber = `${appName.toUpperCase()}-${datePrefix}-${randomSuffix}`;
    });
};
exports.initModel = initModel;
exports.default = Order;
//# sourceMappingURL=order.js.map