import { Model, DataTypes, Sequelize } from 'sequelize';

class BlockedProduct extends Model {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId',
      onDelete: 'CASCADE',
    });
  }
}

const initBlockedProduct = (sequelize: Sequelize) => {
  BlockedProduct.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'BlockedProduct',
      tableName: 'blocked_products',
      timestamps: true,
    }
  );
};

export default BlockedProduct;
export { initBlockedProduct as initModel };
