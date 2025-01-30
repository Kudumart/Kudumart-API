"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/message.ts
const sequelize_1 = require("sequelize");
class Message extends sequelize_1.Model {
    static associate(models) {
        this.belongsTo(models.Conversation, {
            as: "conversation",
            foreignKey: "conversationId",
        });
        // Associate with User model
        this.belongsTo(models.User, {
            as: "user",
            foreignKey: "userId",
        });
    }
}
const initModel = (sequelize) => {
    Message.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        fileUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true, // It can be null if no file is attached
        },
        isRead: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        sequelize,
        modelName: "Message",
        timestamps: true,
        paranoid: false,
        tableName: "messages",
    });
};
exports.initModel = initModel;
exports.default = Message;
//# sourceMappingURL=message.js.map