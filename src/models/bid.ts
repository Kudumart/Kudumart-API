// models/AuctionProduct.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import User from './user';

class Bid extends Model {
  public id!: string;
  public auctionProductId!: string;
  public bidderId!: string;
  public bidAmount!: number;
  public isWinningBid!: boolean;
  public createdAt?: Date;
  public updatedAt?: Date;

  public user?: User;

  static associate(models: any) {
    // Define associations here
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'bidderId',
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
  Bid.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      auctionProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'auction_products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      bidderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      bidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      isWinningBid: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false, 
        allowNull: false 
      },
    },
    {
      sequelize,
      modelName: 'Bid',
      timestamps: true,
      paranoid: false,
      tableName: 'bids',
    }
  );
};

export default Bid;
export { initModel };
