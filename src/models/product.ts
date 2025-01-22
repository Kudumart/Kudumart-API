// models/product.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './user';
import Store from './store';
import SubCategory from './subcategory';

class Product extends Model {
  public id!: string;
  public vendorId!: string;
  public storeId!: string;
  public categoryId!: string;
  public name!: string;
  public sku!: string;
  public condition!: 'brand_new' | 'fairly_used' | 'fairly_foreign' | 'refurbished';
  public description!: string | null;
  public specification!: string | null;
  public price!: number;
  public discount_price!: number | null;
  public image_url!: string | null;
  public additional_images!: object | null; // JSON array or object for additional images
  public warranty!: string | null;
  public return_policy!: string | null;
  public seo_title!: string | null;
  public meta_description!: string | null;
  public keywords!: string | null;
  public status!: 'active' | 'inactive' | 'draft';
  public vendor?: User;  // Declare the relationship to User (vendor)
  public createdAt!: Date;
  public updatedAt!: Date;

  public store!: Store;
  public sub_category!: SubCategory;

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.User, {
      as: 'vendor',
      foreignKey: 'vendorId',
      onDelete: 'RESTRICT'
    });
    this.belongsTo(models.Store, {
      as: 'store',
      foreignKey: 'storeId',
      onDelete: 'RESTRICT'
    });
    this.belongsTo(models.SubCategory, {
      as: 'sub_category',
      foreignKey: 'categoryId',
      onDelete: 'RESTRICT'
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Product.init(
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
        allowNull: true,
      },
      specification: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      additional_images: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      warranty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      return_policy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      seo_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'draft'),
        defaultValue: 'active',
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      timestamps: true,
      paranoid: false,
      tableName: 'products',
    }
  );
};

export default Product;
export { initModel };
