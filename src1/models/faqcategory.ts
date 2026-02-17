// models/FaqCategory.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import Faq from "./faq";

class FaqCategory extends Model {
  public name!: string;
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  public faqs!: Faq;

  // Association with User model
  static associate(models: any) {
    this.hasMany(models.Faq, {
      foreignKey: 'faqCategoryId',
      as: 'faqs',
      onDelete: 'RESTRICT', // Prevent deletion if faq exist
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  FaqCategory.init(
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
      }
    },
    {
      sequelize,
      modelName: "FaqCategory",
      timestamps: true,
      paranoid: false,
      tableName: "faq_categories"
    }
  );
};

export default FaqCategory; 
export { initModel };
