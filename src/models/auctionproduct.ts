// models/AuctionProduct.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import Bid from './bid';
import User from './user';

class AuctionProduct extends Model {
  public id!: string;
  public vendorId!: string;
  public storeId!: string;
  public categoryId!: string;
  public name!: string;
  public sku!: string;
  public condition!: 'brand_new' | 'fairly_used' | 'fairly_foreign' | 'refurbished';
  public description!: string;
  public specification!: object;
  public price!: number;
  public bidIncrement?: number; // Percentage
  public maxBidsPerUser?: number;
  public participantsInterestFee!: number;
  public startDate!: Date;
  public endDate!: Date;
  public image?: string;
  public additionalImages?: object;
  public auctionStatus!: 'upcoming' | 'ongoing' | 'cancelled' | 'ended';
  public createdAt?: Date;
  public updatedAt?: Date;
  public vendor?: User;  // Declare the relationship to User (vendor)

  // Adding the 'bids' property for type safety
  public bids?: Bid[];

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.User, {
      as: 'vendor',
      foreignKey: 'vendorId',
      onDelete: 'RESTRICT',
    });
    this.belongsTo(models.Admin, {
      as: 'admin',
      foreignKey: 'vendorId',
      onDelete: 'RESTRICT',
    });
    this.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      onDelete: 'RESTRICT',
    });
    this.belongsTo(models.SubCategory, {
      as: 'sub_category',
      foreignKey: 'categoryId',
      onDelete: 'RESTRICT',
    });
    this.hasMany(models.Bid, {
      as: 'bids',
      foreignKey: 'auctionProductId',
      onDelete: 'CASCADE',
    })
  }
}

const initModel = (sequelize: Sequelize) => {
  AuctionProduct.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      storeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'sub_categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      condition: {
        type: DataTypes.ENUM('brand_new', 'fairly_used', 'fairly_foreign', 'refurbished'),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      specification: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [], // Ensures it's an array by default
        get() {
          const value = this.getDataValue('specification');
          return typeof value === 'string' ? JSON.parse(value) : value;
        }
      },
      price: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      bidIncrement: {
        type: DataTypes.DECIMAL(29, 2),
        allowNull: true,
      },
      maxBidsPerUser: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      participantsInterestFee: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      additionalImages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [], // Ensures it's an array by default
        get() {
          const value = this.getDataValue('additionalImages');
          return typeof value === 'string' ? JSON.parse(value) : value;
        }
      },
      auctionStatus: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'cancelled', 'ended'),
        defaultValue: 'upcoming',
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'AuctionProduct',
      timestamps: true,
      paranoid: false,
      tableName: 'auction_products',
    }
  );
};

export default AuctionProduct;
export { initModel };
