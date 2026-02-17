import { DataTypes, Model, Sequelize } from "sequelize";

class ProductCharge extends Model {
	public id!: number;
	public name!: string;
	public description!: string;
	public charge_currency!: "USD" | "NGN"; // Enum for currency types
	public charge_amount!: number; // This can be used if calculation_type is 'fixed'
	public charge_percentage!: number; // This can be used if calculation_type is 'percentage'
	public calculation_type!: string; // e.g., 'fixed' or 'percentage'
	public minimum_product_amount!: number;
	public maximum_product_amount!: number;
	public is_active!: boolean;
	public created_at!: Date;
	public updated_at!: Date;
}

const initModel = (sequelize: Sequelize) => {
	ProductCharge.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			charge_currency: {
				type: DataTypes.ENUM("USD", "NGN"),
				allowNull: false,
				defaultValue: "NGN",
			},
			charge_amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true, // Nullable for percentage type
				validate: {
					min: 0, // Ensure charge amount is non-negative
				},
			},
			charge_percentage: {
				type: DataTypes.DECIMAL(5, 2),
				allowNull: true, // Nullable for fixed type
				validate: {
					min: 0,
					max: 100, // Percentage should be between 0 and 100
				},
			},
			calculation_type: {
				type: DataTypes.ENUM("fixed", "percentage"),
				allowNull: false,
			},
			minimum_product_amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			maximum_product_amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			sequelize,
			tableName: "product_charges",
			timestamps: true,
			validate: {
				checkCalculationType() {
					if (this.calculation_type === "fixed") {
						if (
							this.charge_amount == null ||
							isNaN(parseFloat(this.charge_amount as string)) ||
							parseFloat(this.charge_amount as string) <= 0
						) {
							throw new Error(
								"Fixed calculation type requires a positive fixed amount",
							);
						}
					}

					if (this.calculation_type === "percentage") {
						if (
							this.charge_percentage == null ||
							isNaN(parseFloat(this.charge_percentage as string)) ||
							parseFloat(this.charge_percentage as string) <= 0
						) {
							throw new Error(
								"Percentage calculation type requires a positive percentage rate",
							);
						}
					}
				},
			},
		},
	);
};

export default ProductCharge;
export { initModel };
