// models/Order.ts
import { Model, DataTypes, Sequelize, CreateOptions } from 'sequelize';
import User from './user';
import { randomBytes } from "crypto"; 

class Order extends Model {
  public id!: string;
  public userId!: string;
  public trackingNumber!: string;
  public totalAmount!: number;
  public shippingAddress!: string;
  public refId!: string; // Reference ID from payment
  public createdAt?: Date;
  public updatedAt?: Date;

  public user?: User;

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      onDelete: 'RESTRICT',
    });
    this.hasMany(models.OrderItem, {
      as: 'orderItems',
      foreignKey: 'orderId'
    });
    this.hasOne(models.Payment, {
      as: 'payment',
      foreignKey: 'orderId'
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Order.init(
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
      trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      shippingAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      timestamps: true,
      paranoid: false,
      tableName: 'orders',
    }
  );

  // Add hooks
  Order.addHook('beforeCreate', (order: Order) => {
    const appName = process.env.APP_NAME || "APP"; // Use app name from environment variable or fallback
    const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format: yyyyMMdd
    const randomSuffix = randomBytes(3).toString('hex'); // Generate random string

    // Generate tracking number
    order.trackingNumber = `${appName.toUpperCase()}-${datePrefix}-${randomSuffix}`;
  });
};

export default Order;
export { initModel };
