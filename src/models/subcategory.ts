// models/subcategory.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class SubCategory extends Model {
  public id!: string;
  public categoryId!: string;
  public image!: Text;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    this.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    this.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: "products"
    });
    this.hasMany(models.AuctionProduct, {
      foreignKey: 'categoryId',
      as: "auctionProducts"
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  SubCategory.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        references: {
          model: 'Category',
          key: 'id',
        },
        onDelete: 'RESTRICT', // Prevent deletion if associated with a category
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SubCategory",
      timestamps: true,
      paranoid: false,
      tableName: "sub_categories"
    }
  );
};

export default SubCategory; 
export { initModel };
