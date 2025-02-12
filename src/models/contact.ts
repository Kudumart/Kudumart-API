// models/Contact.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Contact extends Model {
  public name!: string;
  public phoneNumber!: string;
  public email!: string;
  public message!: string
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  // Association with User model
  static associate(models: any) {

  }
}

const initModel = (sequelize: Sequelize) => {
  Contact.init(
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
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: "Contact",
      timestamps: true,
      paranoid: false,
      tableName: "contacts"
    }
  );
};

export default Contact; 
export { initModel };
