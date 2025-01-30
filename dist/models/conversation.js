"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/conversation.ts
const sequelize_1 = require("sequelize");
class Conversation extends sequelize_1.Model {
    static associate(models) {
        this.belongsTo(models.Product, {
            as: "product",
            foreignKey: "productId",
        });
        // Associate with User model
        this.belongsTo(models.User, {
            as: "senderUser",
            foreignKey: "senderId",
        });
        this.belongsTo(models.User, {
            as: "receiverUser",
            foreignKey: "receiverId",
        });
        this.hasMany(models.Message, {
            as: "message",
            foreignKey: "conversationId",
        });
    }
}
const initModel = (sequelize) => {
    Conversation.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        productId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        senderId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
        receiverId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "RESTRICT",
        }
    }, {
        sequelize,
        modelName: "Conversation",
        timestamps: true,
        paranoid: false,
        tableName: "conversations",
    });
};
exports.initModel = initModel;
exports.default = Conversation;
//# sourceMappingURL=conversation.js.map