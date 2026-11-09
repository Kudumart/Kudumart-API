// models/installmentMilestone.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

class InstallmentMilestone extends Model {
  public id!: string;
  public planId!: string;
  public installmentNumber!: number;
  public amount!: number;
  public dueDate!: Date;
  public paidAt?: Date | null;
  public status!: 'pending' | 'paid' | 'overdue' | 'cancelled';
  public paymentReference?: string | null;
  public gateway?: string | null;
  public paymentMethod?: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  static associate(models: any) {
    this.belongsTo(models.InstallmentPlan, {
      as: 'plan',
      foreignKey: 'planId',
      onDelete: 'CASCADE',
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  InstallmentMilestone.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'installment_plans',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      installmentNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      paymentReference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gateway: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'InstallmentMilestone',
      tableName: 'installment_milestones',
      timestamps: true,
      indexes: [
        {
          fields: ['planId'],
        },
        {
          fields: ['dueDate'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );
};

export default InstallmentMilestone;
export { initModel };
