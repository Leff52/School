import { Sequelize } from "sequelize"

console.log('Подключение к БД:', {
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT
});

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tournament',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '228red228',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;