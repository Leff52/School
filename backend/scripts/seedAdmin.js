const pool = require('../config/db.config');
const bcrypt = require('bcrypt');

const adminUsername = 'admin';
const adminPassword = 'admin123';
const saltRounds = 10;

async function seedAdmin() {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [adminUsername]);
    if (result.rows.length > 0) {
      console.log('Пользователь admin уже существует в базе данных.');
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [adminUsername, hashedPassword, 'ADMIN']
      );
      console.log('Пользователь admin успешно добавлен в базу данных.');
    }
  } catch (error) {
    console.error('Ошибка при добавлении администратора:', error);
  } finally {
    pool.end();
  }
}

seedAdmin();
