const pool = require('../../config/db.config')
const bcrypt = require('bcrypt')

exports.createZavuch = async (req, res) => {
	// Ожидаем в теле запроса: username и password
	const { username, password } = req.body
	try {
		const hashedPassword = await bcrypt.hash(password, 10)
		// Вставляем пользователя с ролью ZAVUCH
		const result = await pool.query(
			'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
			[username, hashedPassword, 'ZAVUCH']
		)
		res
			.status(201)
			.json({ message: 'Пользователь завуч создан', user: result.rows[0] })
	} catch (error) {
		console.error('Ошибка при создании завуча:', error)
		res.status(500).json({ message: 'Ошибка при создании завуча' })
	}
	
};
exports.deleteZavuch = async (req, res) => {
	// Получаем id завуча из параметров URL
	const { id } = req.params
	try {
		// Выполняем удаление только если у пользователя роль ZAVUCH
		const result = await pool.query(
			"DELETE FROM users WHERE id = $1 AND role = 'ZAVUCH' RETURNING *",
			[id]
		)

		if (result.rowCount === 0) {
			return res
				.status(404)
				.json({ message: 'Пользователь не найден или не имеет роль завуча' })
		}

		res.json({
			message: 'Пользователь завуч успешно удалён',
			user: result.rows[0],
		})
	} catch (error) {
		console.error('Ошибка при удалении завуча:', error)
		res.status(500).json({ message: 'Ошибка при удалении завуча' })
	}
};
