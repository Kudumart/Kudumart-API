// models/Applicant.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Applicant extends Model {
  public id!: string;
  public jobId!: string;
  public name!: string;
  public emailAddress!: string | null;
  public phoneNumber!: string | null;
  public resumeType!: string | null;
  public resume!: string | null;
  public status!: 'applied' | 'rejected' | 'in-progress';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    // Define associations here
    // Example:
    this.belongsTo(models.Job, { as: 'job', foreignKey: 'jobId'  });
  }
}

const initModel = (sequelize: Sequelize) => {
  Applicant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resumeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resume: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('applied', 'rejected', 'in-progress'),
      defaultValue: 'in-progress',
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: "Applicant",
    timestamps: true,
    paranoid: false,
    tableName: "applicants", // Matches your migration table name
  });
};

export default Applicant;
export { initModel };
