import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize';

class ProductReport extends Model {
  public id!: number;
  public productId!: string;
  public userId!: string;
  public reason!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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

export default ProductReport; 