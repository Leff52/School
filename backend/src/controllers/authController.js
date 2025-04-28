const pool = require('../../config/db.config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.login = async (req, res) => {
	const { username, password } = req.body
	try {
		// Поиск пользователя по username
		const result = await pool.query('SELECT * FROM users WHERE username = $1', [
			username,
		])
		if (result.rows.length === 0) {
			return res.status(400).json({ message: 'Неверный логин или пароль' })
		}
		const user = result.rows[0]
		const isValid = await bcrypt.compare(password, user.password)
		if (!isValid) {
			return res.status(400).json({ message: 'Неверный логин или пароль' })
		}
		// Создание JWT-токена (валиден 1 час)
		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		)
		res.json({ token })
	} catch (error) {
		console.error('Ошибка при логине:', error)
		res.status(500).json({ message: 'Внутренняя ошибка сервера' })
	}
}
