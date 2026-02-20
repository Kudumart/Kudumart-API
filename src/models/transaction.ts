// models/transaction.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Transaction extends Model {
  public id!: string;
  public userId!: string;
  public amount!: number;
  public currency!: string;
  public transactionType!: string; // e.g., 'subscription', 'payment', 'sale', 'withdrawal', 'refund'
  public metadata?: any;
  public refId?: string;
  public status!: string; // e.g., 'completed', 'pending', 'failed'
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association with User model
  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId', // Ensure the Transaction model has a 'userId' column
    });
    this.belongsTo(models.Admin, {
      as: 'admin',
      foreignKey: 'userId', // Ensure the Transaction model has a 'userId' column
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Transaction.init(
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
      amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "NGN",
      },
      transactionType: {
        type: DataTypes.STRING, // e.g., 'subscription', 'payment', 'sale', 'withdrawal', 'refund'
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      refId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      timestamps: true,
      paranoid: false,
      tableName: "transactions"
    }
  );
};

export default Transaction;
export { initModel };
