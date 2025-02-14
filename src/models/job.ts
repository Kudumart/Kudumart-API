// models/Job.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Job extends Model {
  public id!: string;
  public creatorId!: string;
  public title!: string | null;
  public slug!: string | null;
  public company!: string | null;
  public logo!: string | null;
  public workplaceType!: 'remote' | 'on-site' | 'hybrid' | null;
  public location!: string | null;
  public jobType!: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'volunteer' | 'internship' | null;
  public description!: string | null;
  public views!: number | null;
  public status!: 'draft' | 'active' | 'closed';
  public readonly createdAt!: Date;
  public updatedAt!: Date;

  static associate(models: any) {
    // Define associations here
    // Example:
    this.hasMany(models.Applicant, {  as: 'applicants', foreignKey: 'jobId' });
  }
}

const initModel = (sequelize: Sequelize) => {
  Job.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workplaceType: {
      type: DataTypes.ENUM('remote', 'on-site', 'hybrid'),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobType: {
      type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'temporary', 'volunteer', 'internship'),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'closed'),
      defaultValue: 'draft',
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: "Job",
    timestamps: true,
    paranoid: false,
    tableName: "jobs", // Matches your migration table name
  });
};

export default Job;
export { initModel };
