import { DataTypes, Model } from "sequelize";

export class ServiceReviews extends Model {
	public id!: string;
	public serviceId!: string;
	public userId!: string;
	public rating!: number;
	public comment!: string;
	public createdAt!: Date;
	public updatedAt!: Date;

	public static associate(models: any) {
		ServiceReviews.belongsTo(models.Services, {
			foreignKey: "serviceId",
			as: "service",
		});
		ServiceReviews.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
	}
}
const initModel = (sequelize: any) => {
	ServiceReviews.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			serviceId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			userId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			rating: {
				type: "INTEGER",
				allowNull: false,
			},
			comment: {
				type: "TEXT",
				allowNull: false,
			},
			createdAt: {
				type: "DATE",
				defaultValue: "NOW",
			},
			updatedAt: {
				type: "DATE",
				defaultValue: "NOW",
			},
		},
		{
			tableName: "ServiceReviews",
			timestamps: true,
			sequelize,
		},
	);
	return ServiceReviews;
};

export default ServiceReviews;
export { initModel };
