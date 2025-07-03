"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAdminNotificationModel = void 0;
const sequelize_1 = require("sequelize");
class AdminNotification extends sequelize_1.Model {
}
const initAdminNotificationModel = (sequelize) => {
    AdminNotification.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        data: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        },
        read: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize,
        modelName: "AdminNotification",
        tableName: "admin_notifications",
        timestamps: true,
    });
};
exports.initAdminNotificationModel = initAdminNotificationModel;
exports.default = AdminNotification;
//# sourceMappingURL=adminnotification.js.map