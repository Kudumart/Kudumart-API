// models/permission.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class Permission extends Model {
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    // Many-to-Many relationship between Permission and Role
    this.belongsToMany(models.Role, {
      through: 'role_permissions', // The join table
      foreignKey: 'permissionId', // Foreign key for Permission in the join table
      as: 'roles', // Alias for accessing roles from a permission
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  Permission.init({
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
    modelName: "Permission",
    timestamps: true,
    paranoid: false,
    tableName: "permissions"
  });
};

export default Permission; 
export { initModel };
