// models/OrderItem.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import Order from './order';

class OrderItem extends Model {
  public id!: string;
  public vendorId!: string;
  public orderId!: string;
  public product!: object; // JSON to accept product object
  public quantity!: number;
  public price!: number;
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
  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
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
      product: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OrderItem',
      timestamps: true,
      paranoid: false,
      tableName: 'order_items',
    }
  );
};

export default OrderItem;
export { initModel };
