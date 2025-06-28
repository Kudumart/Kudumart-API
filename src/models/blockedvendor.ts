import { Model, DataTypes, Sequelize } from 'sequelize';

class BlockedVendor extends Model {
  public id!: string;
  public userId!: string;
  public vendorId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association with User model
  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'vendor',
      foreignKey: 'vendorId',
      onDelete: 'CASCADE',
    });
  }
}

const initBlockedVendor = (sequelize: Sequelize) => {
  BlockedVendor.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'BlockedVendor',
      tableName: 'blocked_vendors',
      timestamps: true,
    }
  );
};

export default BlockedVendor;
export { initBlockedVendor as initModel }; 