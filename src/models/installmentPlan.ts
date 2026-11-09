// models/installmentPlan.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class InstallmentPlan extends Model {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public variantId?: string | null;
  public vendorId!: string;
  public storeId?: string | null;
  public mode!: 'layaway' | 'bnpl';
  public fulfillment_trigger!: 'on_completion' | 'on_deposit';
  public productPrice!: number;
  public shippingFee!: number;
  public financingFee!: number;
  public totalAmount!: number;
  public depositAmount!: number;
  public remainingBalance!: number;
  public numberOfInstallments!: number;
  public tenureDays!: number;
  public status!: 'active' | 'completed' | 'defaulted' | 'cancelled';
  public shippingAddress?: any;
  public orderId?: string | null;
  public reservedUntil!: Date;
  public completedAt?: Date | null;
  public defaultedAt?: Date | null;
  public buyer?: any;
  public product?: any;
  public vendor?: any;
  public milestones?: any[];
  public createdAt?: Date;
  public updatedAt?: Date;

  static associate(models: any) {
    this.belongsTo(models.User, {
      as: 'buyer',
      foreignKey: 'userId',
    });
    this.belongsTo(models.Product, {
      as: 'product',
      foreignKey: 'productId',
    });
    this.belongsTo(models.User, {
      as: 'vendor',
      foreignKey: 'vendorId',
    });
    this.hasMany(models.InstallmentMilestone, {
      as: 'milestones',
      foreignKey: 'planId',
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  InstallmentPlan.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      variantId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      storeId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      mode: {
        type: DataTypes.ENUM('layaway', 'bnpl'),
        allowNull: false,
        defaultValue: 'layaway',
      },
      fulfillment_trigger: {
        type: DataTypes.ENUM('on_completion', 'on_deposit'),
        allowNull: false,
        defaultValue: 'on_completion',
      },
      productPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      shippingFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      financingFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      depositAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      remainingBalance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      numberOfInstallments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      tenureDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
      },
      status: {
        type: DataTypes.ENUM('active', 'completed', 'defaulted', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
      },
      shippingAddress: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      reservedUntil: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      defaultedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'InstallmentPlan',
      tableName: 'installment_plans',
      timestamps: true,
    }
  );
};

export default InstallmentPlan;
export { initModel };
