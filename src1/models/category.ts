// models/category.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Category extends Model {
  public id!: string;
  public image!: Text;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    this.hasMany(models.SubCategory, {
      foreignKey: 'categoryId',
      as: 'subCategories',
      onDelete: 'RESTRICT', // Prevent deletion if subcategories exist
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      modelName: "Category",
      timestamps: true,
      paranoid: false,
      tableName: "categories"
    }
  );
};

export default Category; 
export { initModel };
