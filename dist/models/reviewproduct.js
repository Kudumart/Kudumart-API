"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/ReviewProduct.ts
const sequelize_1 = require("sequelize");
class ReviewProduct extends sequelize_1.Model {
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
    ReviewProduct.init({
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
        productId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        rating: {
            type: sequelize_1.DataTypes.INTEGER, // 1 to 5 stars
            allowNull: false,
            validate: { min: 1, max: 5 }
        },
        comment: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: "ReviewProduct",
        timestamps: true,
        paranoid: false,
        tableName: "review_products"
    });
};
exports.initModel = initModel;
exports.default = ReviewProduct;
//# sourceMappingURL=reviewproduct.js.map