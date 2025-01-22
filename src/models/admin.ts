// models/admin.ts
import bcrypt from "bcrypt";
import { Model, DataTypes, Sequelize } from "sequelize";

class Admin extends Model {
  public id!: string; // Use '!' to indicate these fields are definitely assigned
  public name!: string;
  public email!: string;
  public password!: string;
  public photo?: string;
  public roleId?: string;
  public status?: "active" | "inactive";
  public createdAt?: Date;
  public updatedAt?: Date;

  // Method to hash the password before saving
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  // Method to check the password
  checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  hasRole(requiredRole: string) {
    return this.roleId === requiredRole;
  }

  // Association with Role model
  static associate(models: any) {
    this.belongsTo(models.Role, {
      as: 'role',
      foreignKey: 'roleId',
    });
    this.hasMany(models.Store, { 
      as: 'stores', 
      foreignKey: 'vendorId',
      onDelete: 'RESTRICT', 
    });
  }

}

const initModel = (sequelize: Sequelize) => {
  Admin.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
      },
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true, // Ensure unique emails
      },
      password: DataTypes.STRING,
      photo: DataTypes.TEXT,
      roleId: DataTypes.UUID,
      status: DataTypes.ENUM("active", "inactive"),
    },
    {
      sequelize,
      modelName: "Admin",
      timestamps: true,
      paranoid: false,
      tableName: "admins",
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        auth: {
          attributes: { include: ["password"] }, // Add necessary fields for authentication
        },
      },
    }
  );

  // Add the password hashing hook before saving
  Admin.addHook("beforeSave", async (admin: Admin) => {
    if (admin.changed("password") || admin.isNewRecord) {
      admin.password = await Admin.hashPassword(admin.password);
    }
  });
  
};

// Export the User model and the init function
export default Admin; // Ensure User is exported as default
export { initModel };
