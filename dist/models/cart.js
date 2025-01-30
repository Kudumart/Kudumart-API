"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Cart.ts
const sequelize_1 = require("sequelize");
class Cart extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'productId',
            onDelete: 'CASCADE',
        });
    }
}
const initModel = (sequelize) => {
    Cart.init({
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
        productId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        quantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    }, {
        sequelize,
        modelName: 'Cart',
        timestamps: true,
        paranoid: false,
        tableName: 'carts',
    });
};
exports.initModel = initModel;
exports.default = Cart;
//# sourceMappingURL=cart.js.map