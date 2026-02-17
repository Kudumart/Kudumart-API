// models/paymentgateway.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class PaymentGateway extends Model {
  public id!: string;
  public name!: string;        // The name of the payment gateway (e.g., Stripe, PayPal)
  public publicKey!: string;   // Public API key for the payment gateway
  public secretKey!: string;   // Secret API key for the payment gateway
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const initModel = (sequelize: Sequelize) => {
  PaymentGateway.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publicKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secretKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Active by default
      },
    },
    {
      sequelize,
      modelName: "PaymentGateway",
      timestamps: true,
      paranoid: false,
      tableName: "payment_gateways"
    }
  );
};

export default PaymentGateway; 
export { initModel };
