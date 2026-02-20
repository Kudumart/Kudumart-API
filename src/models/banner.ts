// models/Banner.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Banner extends Model {
  public image?: string;
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  // Association with User model
  static associate(models: any) {

  }
}

const initModel = (sequelize: Sequelize) => {
  Banner.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Banner",
      timestamps: true,
      paranoid: false,
      tableName: "banners"
    }
  );
};

export default Banner; 
export { initModel };
