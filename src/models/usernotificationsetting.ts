// models/usernotificationsetting.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class UserNotificationSetting extends Model {
  public id!: string;
  public userId!: string;  // Refers to the user who owns the setting
  public hotDeals!: boolean; // Whether the user wants notifications for Hot Deals
  public auctionProducts!: boolean; // Whether the user wants notifications for Auction Products
  public subscription!: boolean; // Whether the user wants notifications for Subscription updates
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association with User model
  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId', // Ensure the UserNotificationSetting model has a 'userId' column
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  UserNotificationSetting.init(
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
      hotDeals: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,  // Default is false (not enabled)
      },
      auctionProducts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,  // Default is false (not enabled)
      },
      subscription: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,  // Default is false (not enabled)
      },
    },
    {
      sequelize,
      modelName: "UserNotificationSetting",
      timestamps: true,
      paranoid: false,
      tableName: "user_notification_settings"
    }
  );
};

export default UserNotificationSetting; 
export { initModel };
