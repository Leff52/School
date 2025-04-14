require('dotenv').config({ path: __dirname + '/../.env' })

const { Pool } = require('pg')

console.log('Подключение к БД:', {
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PORT: process.env.DB_PORT,
})

const pool = new Pool({
	database: process.env.DB_NAME || 'empire_zaucha',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || '228red228',
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 5432,
})

module.exports = pool
