
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME || 'kudumart', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
});

const PaymentGateway = sequelize.define('PaymentGateway', {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING },
    secretKey: { type: DataTypes.STRING },
    publicKey: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN },
    isLive: { type: DataTypes.BOOLEAN } // Assuming there might be a flag for live/test or just different rows
}, { tableName: 'payment_gateways', timestamps: false });

async function checkKeys() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const gateways = await PaymentGateway.findAll();
        console.log(JSON.stringify(gateways.map(g => g.toJSON()), null, 2));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkKeys();
