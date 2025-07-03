"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/notification.ts
const sequelize_1 = require("sequelize");
class Notification extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId', // Ensure the Notification model has a 'userId' column
        });
    }
}
const initModel = (sequelize) => {
    Notification.init({
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
        title: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        isRead: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize,
        modelName: "Notification",
        timestamps: true,
        paranoid: false,
        tableName: "notifications"
    });
};
exports.initModel = initModel;
exports.default = Notification;
//# sourceMappingURL=notification.js.map