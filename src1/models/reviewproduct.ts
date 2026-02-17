// models/ReviewProduct.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class ReviewProduct extends Model {
  public userId!: string;
  public productId!: string;
  public rating!: string;
  public comment!: string;
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
  ReviewProduct.init(
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
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER, // 1 to 5 stars
        allowNull: false,
        validate: { min: 1, max: 5 }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ReviewProduct",
      timestamps: true,
      paranoid: false,
      tableName: "review_products"
    }
  );
};

export default ReviewProduct; 
export { initModel };
