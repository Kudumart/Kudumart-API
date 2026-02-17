// models/conversation.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Conversation extends Model {
  public id!: string;
  public productId!: string;
  public senderId!: string;
  public receiverId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate(models: any) {
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

const initModel = (sequelize: Sequelize) => {
  Conversation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      }
    },
    {
      sequelize,
      modelName: "Conversation",
      timestamps: true,
      paranoid: false,
      tableName: "conversations",
    }
  );
};

export default Conversation;
export { initModel };
