// models/message.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Message extends Model {
  public id!: string;
  public conversationId!: string;
  public userId!: string;
  public content?: string;
  public fileUrl?: string;
  public isRead!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate(models: any) {
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

const initModel = (sequelize: Sequelize) => {
  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: true, // It can be null if no file is attached
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Message",
      timestamps: true,
      paranoid: false,
      tableName: "messages",
    }
  );
};

export default Message;
export { initModel };
