"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Faq.ts
const sequelize_1 = require("sequelize");
class Faq extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.FaqCategory, {
            foreignKey: 'faqCategoryId',
            as: 'faqCategory',
        });
    }
}
const initModel = (sequelize) => {
    Faq.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        faqCategoryId: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: 'faq_categories',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        question: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        answer: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: "Faq",
        timestamps: true,
        paranoid: false,
        tableName: "faqs"
    });
};
exports.initModel = initModel;
exports.default = Faq;
//# sourceMappingURL=faq.js.map