import { DataTypes, Model, Sequelize } from "sequelize";

export type QualificationRuleOperator =
	| "EQUALS"
	| "GREATER_THAN_OR_EQUAL"
	| "GREATER_THAN"
	| "LESS_THAN_OR_EQUAL"
	| "LESS_THAN";

export interface QualificationRule {
	id: string;
	entityType: "CUSTOMER" | "VENDOR" | "BOTH";
	metric: string;
	operator: QualificationRuleOperator;
	value: number;
	windowDays?: number;
}

export interface CommissionRule {
	id: string;
	entityType: "CUSTOMER" | "VENDOR" | "BOTH";
	trigger: "CUSTOMER_COMPLETED_ORDER" | "VENDOR_COMPLETED_ORDER";
	calculationType: "PERCENTAGE" | "FIXED";
	rate: number;
	currency?: string;
	minimumSourceAmount?: number;
	maximumCommissionAmount?: number;
}

class ReferralProgram extends Model {
	public id!: string;
	public name!: string;
	public code!: string;
	public description?: string;
	public referrerType!:
		| "SALES_AGENT"
		| "CUSTOMER"
		| "VENDOR"
		| "AFFILIATE"
		| "PARTNER";
	public referredEntityType!: "CUSTOMER" | "VENDOR" | "BOTH";
	public status!:
		| "DRAFT"
		| "SCHEDULED"
		| "ACTIVE"
		| "PAUSED"
		| "ENDED"
		| "ARCHIVED";
	public startsAt?: Date;
	public endsAt?: Date;
	public attributionModel!:
		| "FIRST_TOUCH"
		| "LAST_TOUCH"
		| "MANUAL_ASSIGNMENT"
		| "CRM_OWNER"
		| "REFERRAL_CODE_PRIORITY";
	public attributionWindowDays!: number;
	public commissionDurationDays?: number;
	public holdingPeriodDays!: number;
	public qualificationRules!: QualificationRule[];
	public commissionRules!: CommissionRule[];
	public currencyMode!: "TRANSACTION_CURRENCY" | "FIXED_PAYOUT_CURRENCY";
	public defaultPayoutCurrency?: string;
	public minimumPayoutAmount!: string;
	public allowExistingUsers!: boolean;
	public allowSelfReferral!: boolean;
	public reassignmentRequiresApproval!: boolean;
	public termsUrl?: string;
	public createdBy?: string;
	public updatedBy?: string;
	public createdAt!: Date;
	public updatedAt!: Date;

	static associate(models: any) {
		this.hasMany(models.ReferralCode, {
			as: "referralCodes",
			foreignKey: "programId",
		});
		this.hasMany(models.ReferralVisit, { as: "visits", foreignKey: "programId" });
		this.hasMany(models.Referral, { as: "referrals", foreignKey: "programId" });
		this.hasMany(models.CommissionEarning, { as: "commissionEarnings", foreignKey: "programId" });
		this.belongsTo(models.Admin, {
			as: "creator",
			foreignKey: "createdBy",
		});
		this.belongsTo(models.Admin, {
			as: "updater",
			foreignKey: "updatedBy",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ReferralProgram.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			name: { type: DataTypes.STRING(150), allowNull: false },
			code: {
				type: DataTypes.STRING(60),
				allowNull: false,
				unique: true,
				set(value: string) {
					this.setDataValue("code", value.trim().toUpperCase());
				},
			},
			description: { type: DataTypes.TEXT, allowNull: true },
			referrerType: {
				type: DataTypes.ENUM(
					"SALES_AGENT",
					"CUSTOMER",
					"VENDOR",
					"AFFILIATE",
					"PARTNER",
				),
				allowNull: false,
				defaultValue: "SALES_AGENT",
			},
			referredEntityType: {
				type: DataTypes.ENUM("CUSTOMER", "VENDOR", "BOTH"),
				allowNull: false,
				defaultValue: "VENDOR",
			},
			status: {
				type: DataTypes.ENUM(
					"DRAFT",
					"SCHEDULED",
					"ACTIVE",
					"PAUSED",
					"ENDED",
					"ARCHIVED",
				),
				allowNull: false,
				defaultValue: "DRAFT",
			},
			startsAt: { type: DataTypes.DATE, allowNull: true },
			endsAt: { type: DataTypes.DATE, allowNull: true },
			attributionModel: {
				type: DataTypes.ENUM(
					"FIRST_TOUCH",
					"LAST_TOUCH",
					"MANUAL_ASSIGNMENT",
					"CRM_OWNER",
					"REFERRAL_CODE_PRIORITY",
				),
				allowNull: false,
				defaultValue: "FIRST_TOUCH",
			},
			attributionWindowDays: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 60,
			},
			commissionDurationDays: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: true,
			},
			holdingPeriodDays: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 14,
			},
			qualificationRules: {
				type: DataTypes.JSON,
				allowNull: false,
				defaultValue: [],
			},
			commissionRules: {
				type: DataTypes.JSON,
				allowNull: false,
				defaultValue: [],
			},
			currencyMode: {
				type: DataTypes.ENUM(
					"TRANSACTION_CURRENCY",
					"FIXED_PAYOUT_CURRENCY",
				),
				allowNull: false,
				defaultValue: "TRANSACTION_CURRENCY",
			},
			defaultPayoutCurrency: {
				type: DataTypes.STRING(3),
				allowNull: true,
				set(value: string | null) {
					this.setDataValue("defaultPayoutCurrency", value?.toUpperCase() || null);
				},
			},
			minimumPayoutAmount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: false,
				defaultValue: 0,
			},
			allowExistingUsers: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			allowSelfReferral: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			reassignmentRequiresApproval: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			termsUrl: { type: DataTypes.TEXT, allowNull: true },
			createdBy: { type: DataTypes.UUID, allowNull: true },
			updatedBy: { type: DataTypes.UUID, allowNull: true },
		},
		{
			sequelize,
			modelName: "ReferralProgram",
			tableName: "referral_programs",
			timestamps: true,
			paranoid: false,
		},
	);
};

export default ReferralProgram;
export { initModel };
