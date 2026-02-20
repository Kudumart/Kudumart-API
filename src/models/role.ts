// models/role.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Role extends Model {
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    // Many-to-Many relationship between Role and Permission
    this.belongsToMany(models.Permission, {
      through: 'role_permissions', // The join table
      foreignKey: 'roleId', // Foreign key for Role in the join table
      as: 'permissions', // Alias for accessing permissions from a role
    });

    this.hasMany(models.Admin, {
      foreignKey: 'roleId',
      as: 'admins', // Alias for the relationship
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    modelName: "Role",
    timestamps: true,
    paranoid: false,
    tableName: "roles"
  });
};

export default Role; 
export { initModel };
