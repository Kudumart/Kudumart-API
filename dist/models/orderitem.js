"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/OrderItem.ts
const sequelize_1 = require("sequelize");
class OrderItem extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.Order, {
            as: 'order',
            foreignKey: 'orderId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT'
        });
        this.belongsTo(models.Admin, {
            as: 'admin',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT'
        });
    }
}
const initModel = (sequelize) => {
    OrderItem.init({
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
        orderId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "orders",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
        product: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
        },
        quantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'OrderItem',
        timestamps: true,
        paranoid: false,
        tableName: 'order_items',
    });
};
exports.initModel = initModel;
exports.default = OrderItem;
//# sourceMappingURL=orderitem.js.map