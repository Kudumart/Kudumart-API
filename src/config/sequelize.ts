import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST,
    port: 8889,
    dialect: 'mysql',
    logging: false,
    timezone: '+00:00',
  }
);

export default sequelize;
