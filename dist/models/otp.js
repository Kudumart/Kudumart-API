"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/otp.ts
const sequelize_1 = require("sequelize");
class OTP extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId', // Ensure the OTP model has a 'userId' column
        });
    }
}
const initModel = (sequelize) => {
    OTP.init({
        userId: sequelize_1.DataTypes.UUID,
        otpCode: sequelize_1.DataTypes.STRING,
        expiresAt: sequelize_1.DataTypes.DATE,
    }, {
        sequelize,
        modelName: "OTP",
        timestamps: true,
        paranoid: false,
        tableName: "otps"
    });
};
exports.initModel = initModel;
exports.default = OTP;
//# sourceMappingURL=otp.js.map