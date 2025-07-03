"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/BankInformation.ts
const sequelize_1 = require("sequelize");
class BankInformation extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
    }
}
const initModel = (sequelize) => {
    BankInformation.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        vendorId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        bankInfo: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'BankInformation',
        timestamps: true,
        paranoid: false,
        tableName: 'bank_informations',
    });
};
exports.initModel = initModel;
exports.default = BankInformation;
//# sourceMappingURL=bankinformation.js.map