"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/kyc.ts
const sequelize_1 = require("sequelize");
class KYC extends sequelize_1.Model {
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'vendorId', // Ensure the OTP model has a 'userId' column
        });
    }
}
const initModel = (sequelize) => {
    KYC.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        vendorId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        businessName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        contactEmail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure email is unique
        },
        contactPhoneNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        businessDescription: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        businessLink: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        businessAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        businessRegistrationNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        idVerification: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            get() {
                const value = this.getDataValue('idVerification');
                return typeof value === 'string' ? JSON.parse(value) : value;
            }
        },
        adminNote: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        isVerified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false, // Default is not verified
        },
    }, {
        sequelize,
        modelName: "KYC",
        timestamps: true,
        paranoid: false,
        tableName: "kycs"
    });
};
exports.initModel = initModel;
exports.default = KYC;
//# sourceMappingURL=kyc.js.map