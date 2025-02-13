// models/notification.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Notification extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public message!: string;
  public type!: string; // e.g., 'transaction', 'subscription', etc.
  public isRead!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association with User model
  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId', // Ensure the Notification model has a 'userId' column
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Notification.init(
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
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      timestamps: true,
      paranoid: false,
      tableName: "notifications"
    }
  );
};

export default Notification; 
export { initModel };
