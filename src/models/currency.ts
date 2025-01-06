// models/Currency.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Currency extends Model {
  public id!: string;
  public name!: string;
  public symbol!: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  static associate(models: any) {
    // Define associations here

  }
}

const initModel = (sequelize: Sequelize) => {
  Currency.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Currency',
      timestamps: true,
      paranoid: false,
      tableName: 'currencies',
    }
  );
};

export default Currency;
export { initModel };
