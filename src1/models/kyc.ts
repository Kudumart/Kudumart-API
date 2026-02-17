// models/kyc.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './user';

class KYC extends Model {
  public id!: string;
  public vendorId!: string;
  public businessName!: string;
  public contactEmail!: string; // Use string instead of Text
  public contactPhoneNumber!: string;
  public businessDescription!: string;
  public businessLink!: string; // Use string instead of Text
  public businessRegistrationNumber!: string;
  public taxIdentificationNumber!: string;
  public idVerification!: { // Specify the structure for idVerification
    name: string;
    number: string; // URL or path to the front photo
  };
  public certificateOfIncorporation!: string;
  public adminNote!: string;
  public isVerified!: boolean; // Change to boolean type
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public user?: User;

  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'vendorId', // Ensure the OTP model has a 'userId' column
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  KYC.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      businessName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure email is unique
      },
      contactPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      businessDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      businessLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      businessAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      businessRegistrationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      idVerification: {
        type: DataTypes.JSON, // This could be a URL to the uploaded document
        allowNull: true,
        defaultValue: [], // Ensures it's an array by default
        get() {
          const value = this.getDataValue('idVerification');
          return typeof value === 'string' ? JSON.parse(value) : value;
        }
      },
      adminNote: {
        type: DataTypes.TEXT, // This field is for admin's notes or remarks
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default is not verified
      },
    },
    {
      sequelize,
      modelName: "KYC",
      timestamps: true,
      paranoid: false,
      tableName: "kycs"
    }
  );
};

export default KYC; 
export { initModel };
