import { Model, DataTypes, Sequelize } from 'sequelize';

class ProductReport extends Model {
  public id!: number;
  public productId!: string;
  public userId!: string;
  public reason!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const initModel = (sequelize: Sequelize) => {
  ProductReport.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ProductReport',
      tableName: 'ProductReports',
    }
  );
};

export default ProductReport;
export { initModel };