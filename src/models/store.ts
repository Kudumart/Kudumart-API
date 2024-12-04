// models/store.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

// Define the structure for deliveryOptions
interface DeliveryOption {
  city: string;
  price: string;
  arrival_day: string;
}

class Store extends Model {
  public id!: string;
  public vendorId!: string;
  public name!: string;
  public location!: { // Specify the structure for location
    address: string;
    city: string;
    state: string;
    country: string;
  };
  public businessHours!: { // Specify the structure for businessHours
    monday_friday: string;
    saturday: string;
    sunday?: string;
  };
  public deliveryOptions!: DeliveryOption[];
  public tipsOnFinding!: string;
  public logo!: string;
  public isVerified!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate(models: any) {
    // Associate with User model
    this.belongsTo(models.User, { 
      as: 'vendor',
      foreignKey: 'vendorId' 
    });
    // Associate with User model
    this.hasMany(models.Product, { 
      as: 'products',
      foreignKey: 'storeId' 
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Store.init(
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
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.JSON,
        allowNull: true // Address or general location
      },
      businessHours: {
        type: DataTypes.JSON, // Example: { "Monday-Friday": "9am - 6pm", "Saturday": "10am - 4pm" }
        allowNull: true
      },
      deliveryOptions: {
        type: DataTypes.JSON, // Example: { "Standard": "5-7 days", "Express": "2-3 days" }
        allowNull: true
      },
      tipsOnFinding: {
        type: DataTypes.TEXT, // Any tips for finding the store, e.g., "Near Central Mall, second floor"
        allowNull: true
      },
      logo: {
        type: DataTypes.TEXT, // Any tips for finding the store, e.g., "Near Central Mall, second floor"
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default is not verified
      },
    },
    {
      sequelize,
      modelName: "Store",
      timestamps: true,
      paranoid: false,
      tableName: "stores"
    }
  );
};

export default Store;
export { initModel };