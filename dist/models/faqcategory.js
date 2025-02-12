"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/FaqCategory.ts
const sequelize_1 = require("sequelize");
class FaqCategory extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.hasMany(models.Faq, {
            foreignKey: 'faqCategoryId',
            as: 'faqs',
            onDelete: 'RESTRICT', // Prevent deletion if faq exist
        });
    }
}
const initModel = (sequelize) => {
    FaqCategory.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: "FaqCategory",
        timestamps: true,
        paranoid: false,
        tableName: "faq_categories"
    });
};
exports.initModel = initModel;
exports.default = FaqCategory;
//# sourceMappingURL=faqcategory.js.map