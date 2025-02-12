// models/Faq.ts
import { Model, DataTypes, Sequelize } from "sequelize";

class Faq extends Model {
  public faqCategoryId!: string;
  public question!: string;
  public answer!: string;
  public updatedAt!: Date;
  public deletedAt!: Date | null;

  // Association with User model
  static associate(models: any) {
    this.belongsTo(models.FaqCategory, {
      foreignKey: 'faqCategoryId',
      as: 'faqCategory',
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Faq.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      faqCategoryId: {
        type: DataTypes.UUID,
        references: {
          model: 'faq_categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Faq",
      timestamps: true,
      paranoid: false,
      tableName: "faqs"
    }
  );
};

export default Faq; 
export { initModel };
