// models/Withdrawal.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Withdrawal extends Model {
  public id!: string;
  public vendorId?: string;
  public bankInformation?: object;
  public amount!: string;
  public currency?: string;
  public status?: string;
  public note?: string;
  public paymentReceipt?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  // Association with User model
  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'vendor',
      foreignKey: 'vendorId', // Ensure the Withdrawal model has a 'vendorId' column
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Withdrawal.init(
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
      },
      bankInformation: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [], // Ensures it's an array by default
        get() {
          const value = this.getDataValue('bankInformation');
          return typeof value === 'string' ? JSON.parse(value) : value;
        }
      },
      amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending", // Values: pending, approved, rejected
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paymentReceipt: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional field
      },
    },
    {
      sequelize,
      modelName: "Withdrawal",
      timestamps: true,
      paranoid: false,
      tableName: "withdrawals"
    }
  );
};

export default Withdrawal;
export { initModel };
