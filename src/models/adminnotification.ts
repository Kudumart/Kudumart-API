import { Model, DataTypes, Sequelize } from "sequelize";

class AdminNotification extends Model {
  public id!: number;
  public type!: string;
  public message!: string;
  public data?: object;
  public read!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initAdminNotificationModel = (sequelize: Sequelize) => {
  AdminNotification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AdminNotification",
      tableName: "admin_notifications",
      timestamps: true,
    }
  );
};

export default AdminNotification; 