"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/otp.ts
const sequelize_1 = require("sequelize");
class OTP extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: "user",
            foreignKey: "userId", // Ensure the OTP model has a 'userId' column
        });
    }
}
const initModel = (sequelize) => {
    OTP.init({
        userId: sequelize_1.DataTypes.UUID,
        otpCode: {
            allowNull: true,
            type: sequelize_1.DataTypes.STRING,
            validate: {
                notBothNull(value) {
                    if (!value && !this.otpToken) {
                        throw new Error("Either otpCode or otpToken must be provided");
                    }
                },
            },
        },
        otpToken: {
            allowNull: true,
            type: sequelize_1.DataTypes.STRING,
            validate: {
                notBothNull(value) {
                    if (!value && !this.otpCode) {
                        throw new Error("Either otpCode or otpToken must be provided");
                    }
                },
            },
        },
        otpTokenExpiresAt: {
            allowNull: true,
            type: sequelize_1.DataTypes.DATE,
            validate: {
                notBothNull(value) {
                    if (!value && !this.expiresAt) {
                        throw new Error("Either otpTokenExpiresAt or expiresAt must be provided");
                    }
                },
            },
        },
        expiresAt: {
            allowNull: true,
            type: sequelize_1.DataTypes.DATE,
            validate: {
                notBothNull(value) {
                    if (!value && !this.otpTokenExpiresAt) {
                        throw new Error("Either expiresAt or otpTokenExpiresAt must be provided");
                    }
                },
            },
        },
    }, {
        sequelize,
        modelName: "OTP",
        timestamps: true,
        paranoid: false,
        tableName: "otps",
        validate: {
            atLeastOneFieldRequired() {
                if (!this.otpCode && !this.otpToken) {
                    throw new Error("Either otpCode or otpToken must be provided");
                }
            },
            atLeastOneExpirationFieldRequired() {
                if (!this.otpTokenExpiresAt && !this.expiresAt) {
                    throw new Error("Either otpTokenExpiresAt or expiresAt must be provided");
                }
            },
        },
    });
};
exports.initModel = initModel;
exports.default = OTP;
//# sourceMappingURL=otp.js.map