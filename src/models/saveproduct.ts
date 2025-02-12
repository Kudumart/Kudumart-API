// models/SaveProduct.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class SaveProduct extends Model {
  public userId!: string;
  public productId!: string;
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  // Association with User model
  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId',
      onDelete: 'RESTRICT',
    });
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      onDelete: 'RESTRICT'
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  SaveProduct.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
    },
    {
      sequelize,
      modelName: "SaveProduct",
      timestamps: true,
      paranoid: false,
      tableName: "save_products"
    }
  );
};

export default SaveProduct; 
export { initModel };
