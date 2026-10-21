import { DataTypes, Model, Sequelize } from "sequelize";

class KycReviewEvent extends Model {
	public id!: string;
	public kycId!: string;
	public reviewerId?: string;
	public fieldName!: string;
	public status!: "pending" | "approved" | "rejected";
	public reason?: string;
}

const initModel = (sequelize: Sequelize) => {
	KycReviewEvent.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		kycId: { type: DataTypes.UUID, allowNull: false },
		reviewerId: { type: DataTypes.UUID, allowNull: true },
		fieldName: { type: DataTypes.STRING, allowNull: false },
		status: { type: DataTypes.ENUM("pending", "approved", "rejected"), allowNull: false },
		reason: { type: DataTypes.TEXT, allowNull: true },
	}, { sequelize, modelName: "KycReviewEvent", tableName: "kyc_review_events", timestamps: true });
};

export default KycReviewEvent;
export { initModel };
