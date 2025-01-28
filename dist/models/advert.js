"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Advert.ts
const sequelize_1 = require("sequelize");
class Advert extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'userId',
            onDelete: 'RESTRICT'
        });
        this.belongsTo(models.Admin, {
            as: 'admin',
            foreignKey: 'userId',
            onDelete: 'RESTRICT'
        });
        this.belongsTo(models.Product, {
            as: 'product',
            foreignKey: 'productId',
            onDelete: 'RESTRICT'
        });
        this.belongsTo(models.SubCategory, {
            as: 'sub_category',
            foreignKey: 'categoryId',
            onDelete: 'RESTRICT'
        });
    }
}
const initModel = (sequelize) => {
    Advert.init({
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
        categoryId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sub_categories',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        productId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        title: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        media_url: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        clicks: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        status: {
            allowNull: false,
            type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: "pending"
        },
        adminNote: {
            allowNull: true,
            type: sequelize_1.DataTypes.TEXT
        },
    }, {
        sequelize,
        modelName: 'Advert',
        timestamps: true,
        paranoid: false,
        tableName: 'adverts',
    });
};
exports.initModel = initModel;
exports.default = Advert;
//# sourceMappingURL=advert.js.map