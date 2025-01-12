// models/Order.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './user';

class Order extends Model {
  public id!: string;
  public userId!: string;
  public totalAmount!: number;
  public shippingAddress!: string;
  public status!: string;
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
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      shippingAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
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
};

export default Order;
export { initModel };
