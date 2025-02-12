// models/Testimonial.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Testimonial extends Model {
  public name?: string;
  public position!: string;
  public photo?: string;
  public message?: string
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  // Association with User model
  static associate(models: any) {

  }
}

const initModel = (sequelize: Sequelize) => {
  Testimonial.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: true
      },
      photo: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "Testimonial",
      timestamps: true,
      paranoid: false,
      tableName: "testimonials"
    }
  );
};

export default Testimonial; 
export { initModel };
