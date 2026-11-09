// models/installmentConfig.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export interface AllowedTenure {
  id: string;
  label: string;
  installments: number;
  tenure_days: number;
  interval_days: number;
  is_active?: boolean;
}

class InstallmentConfig extends Model {
  public id!: number;
  public system_mode!: 'disabled' | 'layaway_only' | 'bnpl_only' | 'hybrid';
  public fulfillment_trigger!: 'on_completion' | 'on_deposit';
  public min_order_amount!: number;
  public max_order_amount!: number;
  public min_deposit_percentage!: number;
  public allowed_tenures!: AllowedTenure[];
  public financing_fee_percentage!: number;
  public grace_period_days!: number;
  public cancellation_fee_percentage!: number;
  public vendor_split_percentage!: number;
  public refund_to_wallet!: boolean;
  public eligible_categories!: string[];
  public vendor_restriction!: 'all_vendors' | 'verified_only';
  public createdAt?: Date;
  public updatedAt?: Date;

  static associate(_models: any) {
    // Global singleton configuration
  }
}

export const defaultTenures: AllowedTenure[] = [
  { id: '2_payments', label: '2 Payments (30 Days)', installments: 2, tenure_days: 30, interval_days: 30, is_active: true },
  { id: '3_payments', label: '3 Payments (60 Days)', installments: 3, tenure_days: 60, interval_days: 30, is_active: true },
  { id: '4_payments', label: '4 Payments (90 Days)', installments: 4, tenure_days: 90, interval_days: 30, is_active: true },
];

const initModel = (sequelize: Sequelize) => {
  InstallmentConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      system_mode: {
        type: DataTypes.ENUM('disabled', 'layaway_only', 'bnpl_only', 'hybrid'),
        allowNull: false,
        defaultValue: 'layaway_only',
      },
      fulfillment_trigger: {
        type: DataTypes.ENUM('on_completion', 'on_deposit'),
        allowNull: false,
        defaultValue: 'on_completion',
      },
      min_order_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 25000.0,
      },
      max_order_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 2000000.0,
      },
      min_deposit_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 25,
      },
      allowed_tenures: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: defaultTenures,
      },
      financing_fee_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      grace_period_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      cancellation_fee_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 8.0,
      },
      vendor_split_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 50.0,
      },
      refund_to_wallet: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      eligible_categories: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      vendor_restriction: {
        type: DataTypes.ENUM('all_vendors', 'verified_only'),
        allowNull: false,
        defaultValue: 'all_vendors',
      },
    },
    {
      sequelize,
      tableName: 'installment_configs',
      timestamps: true,
    }
  );
};

export default InstallmentConfig;
export { initModel };
