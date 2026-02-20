// models/OrderItem.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import Order from './order';

class Payment extends Model {
  public id!: string;
  public orderId!: string;
  public refId!: string; // Paystack reference ID
  public status!: string;
  public amount!: number;
  public currency!: string;
  public channel!: string;
  public paymentDate!: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  public order?: Order;

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.Order, {
      as: 'order',
      foreignKey: 'orderId',
      onDelete: 'RESTRICT',
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Payment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      refId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      channel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      timestamps: true,
      paranoid: false,
      tableName: 'payments',
    }
  );
};

export default Payment;
export { initModel };
