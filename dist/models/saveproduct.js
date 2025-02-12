"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/SaveProduct.ts
const sequelize_1 = require("sequelize");
class SaveProduct extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        // Define associations here
        this.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'productId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
            onDelete: 'RESTRICT'
        });
    }
}
const initModel = (sequelize) => {
    SaveProduct.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        productId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "products",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
    }, {
        sequelize,
        modelName: "SaveProduct",
        timestamps: true,
        paranoid: false,
        tableName: "save_products"
    });
};
exports.initModel = initModel;
exports.default = SaveProduct;
//# sourceMappingURL=saveproduct.js.map