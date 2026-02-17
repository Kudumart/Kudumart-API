"use strict";
import { Model, Sequelize, DataTypes } from "sequelize";
import User from "./user";
import AuctionProduct from "./auctionproduct";

class AuctionReminders extends Model {
	public id!: number;
	public userId!: number;
	public auctionProductId!: number;
	public sendDate!: Date;
	public daysBefore!: number;
	public sent!: boolean;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public user?: User;
	public auctionProduct?: AuctionProduct;
	/**
	 * Helper method for defining associations.
	 * This method is not a part of Sequelize lifecycle.
	 * The `models/index` file will call this method automatically.
	 */
	static associate(models: any) {
		// define association here
		this.belongsTo(models.User, {
			as: "user",
			foreignKey: "userId",
			onDelete: "RESTRICT",
		});
		this.belongsTo(models.AuctionProduct, {
			as: "auctionProduct",
			foreignKey: "auctionProductId",
			onDelete: "RESTRICT",
		});
	}
}
const initModel = (sequelize: Sequelize) => {
	AuctionReminders.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			auctionProductId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "auction_products",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			sendDate: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			daysBefore: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			sent: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: "AuctionReminders",
			tableName: "auction_reminders",
			timestamps: true,
		},
	);
	return AuctionReminders;
};

export default AuctionReminders;
export { initModel };

