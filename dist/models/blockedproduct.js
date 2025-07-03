"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
const sequelize_1 = require("sequelize");
class BlockedProduct extends sequelize_1.Model {
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            onDelete: 'CASCADE',
        });
        this.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'productId',
            onDelete: 'CASCADE',
        });
    }
}
const initBlockedProduct = (sequelize) => {
    BlockedProduct.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        productId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'BlockedProduct',
        tableName: 'blocked_products',
        timestamps: true,
    });
};
exports.initModel = initBlockedProduct;
exports.default = BlockedProduct;
//# sourceMappingURL=blockedproduct.js.map