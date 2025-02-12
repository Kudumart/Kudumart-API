// models/Advert.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Advert extends Model {
  public id!: string;
  public userId!: string;
  public categoryId!: string;
  public productId?: string;
  public title!: string;
  public description!: string;
  public media_url!: string;
  public link?: string;
  public status?: "pending" | "approved" | "rejected";
  public adminNote?: string;
  public showOnHomepage?: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.User, {
      as: 'vendor',
      foreignKey: 'userId',
      onDelete: 'RESTRICT'
    });
    this.belongsTo(models.Admin, {
      as: 'admin',
      foreignKey: 'userId',
      onDelete: 'RESTRICT'
    });
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId',
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
      productId: {
        type: DataTypes.UUID,
        allowNull: true,
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
      link: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      clicks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: "pending"
      },
      adminNote: {
        allowNull: true,
        type: DataTypes.TEXT
      },
      showOnHomepage: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Default to false (not on homepage)
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
