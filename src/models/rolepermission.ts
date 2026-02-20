// models/rolepermission.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import Role from './role';
import Permission from './permission';

class RolePermission extends Model {
  public id!: string;
  public roleId!: string;
  public permissionId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations
  static associate(models: any) {
    this.belongsTo(Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
    this.belongsTo(Permission, {
      foreignKey: 'permissionId',
      as: 'permission',
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  RolePermission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.UUID,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    permissionId: {
      type: DataTypes.UUID,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: "RolePermission",
    timestamps: true,
    paranoid: false,
    tableName: "role_permissions"
  });
};

export default RolePermission; 
export { initModel };
