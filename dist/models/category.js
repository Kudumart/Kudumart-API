"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/category.ts
const sequelize_1 = require("sequelize");
class Category extends sequelize_1.Model {
    static associate(models) {
        this.hasMany(models.SubCategory, {
            foreignKey: 'categoryId',
            as: 'subCategories',
            onDelete: 'RESTRICT', // Prevent deletion if subcategories exist
        });
    }
}
const initModel = (sequelize) => {
    Category.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        image: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Category",
        timestamps: true,
        paranoid: false,
        tableName: "categories"
    });
};
exports.initModel = initModel;
exports.default = Category;
//# sourceMappingURL=category.js.map