"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Advert.ts
const sequelize_1 = require("sequelize");
class Advert extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
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
        status: {
            allowNull: false,
            type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected'),
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