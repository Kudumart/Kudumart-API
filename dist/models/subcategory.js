"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/subcategory.ts
const sequelize_1 = require("sequelize");
class SubCategory extends sequelize_1.Model {
    static associate(models) {
        this.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category',
        });
    }
}
const initModel = (sequelize) => {
    SubCategory.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        categoryId: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: 'Category',
                key: 'id',
            },
            onDelete: 'RESTRICT', // Prevent deletion if associated with a category
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
        modelName: "SubCategory",
        timestamps: true,
        paranoid: false,
        tableName: "sub_categories"
    });
};
exports.initModel = initModel;
exports.default = SubCategory;
//# sourceMappingURL=subcategory.js.map