import { DataTypes, Model } from "sequelize";

export class ServiceBookings extends Model {
	public id!: string;
	public serviceId!: string;
	public userId!: string;
	public vendorId!: string;
	public bookingDate!: Date;
	public status!: string;
	public service?: any; // Association with Services
	public provider?: any; // Association with Users as provider
	public createdAt!: Date;
	public updatedAt!: Date;

	public static associate(models: any) {
		ServiceBookings.belongsTo(models.Services, {
			foreignKey: "serviceId",
			as: "service",
		});
		ServiceBookings.belongsTo(models.User, {
			foreignKey: "userId",
			as: "user",
		});
		ServiceBookings.belongsTo(models.User, {
			foreignKey: "vendorId",
			as: "provider",
		});
	}
}

const initModel = (sequelize: any) => {
	ServiceBookings.init(
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
			vendorId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			bookingDate: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM("pending", "confirmed", "canceled", "completed"),
				allowNull: false,
				defaultValue: "pending",
			},
			createdAt: {
				type: "DATE",
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: "DATE",
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: "ServiceBookings",
			timestamps: true,
			sequelize,
		},
	);
	return ServiceBookings;
};

export default ServiceBookings;
export { initModel };
