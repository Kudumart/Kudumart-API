// models/Advert.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Advert extends Model {
  public id!: string;
  public userId!: string;
  public categoryId!: string;
  public title!: string;
  public description!: string;
  public media_url!: string;
  public status?: "pending" | "approved" | "rejected";
  public createdAt?: Date;
  public updatedAt?: Date;

  static associate(models: any) {
    // Define associations here

  }
}

const initModel = (sequelize: Sequelize) => {
  Advert.init(
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
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'sub_categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      media_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      },
    },
    {
      sequelize,
      modelName: 'Advert',
      timestamps: true,
      paranoid: false,
      tableName: 'adverts',
    }
  );
};

export default Advert;
export { initModel };
