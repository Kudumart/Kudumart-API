"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/usernotificationsetting.ts
const sequelize_1 = require("sequelize");
class UserNotificationSetting extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId', // Ensure the UserNotificationSetting model has a 'userId' column
        });
    }
}
const initModel = (sequelize) => {
    UserNotificationSetting.init({
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
        hotDeals: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true, // Default is false (not enabled)
        },
        auctionProducts: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true, // Default is false (not enabled)
        },
        subscription: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true, // Default is false (not enabled)
        },
    }, {
        sequelize,
        modelName: "UserNotificationSetting",
        timestamps: true,
        paranoid: false,
        tableName: "user_notification_settings"
    });
};
exports.initModel = initModel;
exports.default = UserNotificationSetting;
//# sourceMappingURL=usernotificationsetting.js.map