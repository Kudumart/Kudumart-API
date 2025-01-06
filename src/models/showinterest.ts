// models/ShowInterest.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './user';

class ShowInterest extends Model {
  public id!: string;
  public userId!: string;
  public auctionProductId!: string;
  public amountPaid!: number;
  public status?: "pending" | "confirmed";
  public createdAt?: Date;
  public updatedAt?: Date;

  public user?: User;

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      onDelete: 'RESTRICT',
    });
    this.belongsTo(models.AuctionProduct, {
      as: 'auctionProduct',
      foreignKey: 'auctionProductId',
      onDelete: 'CASCADE',
    });
  }
}

const initModel = (sequelize: Sequelize) => {
  ShowInterest.init(
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
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      auctionProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'auction_products', // Ensure this matches your AuctionProduct table name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: 'ShowInterest',
      timestamps: true,
      paranoid: false,
      tableName: 'show_interests',
    }
  );
};

export default ShowInterest;
export { initModel };
