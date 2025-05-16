const pool = require('../../config/db.config')
const bcrypt = require('bcrypt')

exports.createZavuch = async (req, res) => {
	const { username, password } = req.body
	try {
		const hashedPassword = await bcrypt.hash(password, 10)
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
exports.getZavuchey = async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT id, username FROM users WHERE role = 'ZAVUCH'"
		)
		res.json({ zavuchey: result.rows })
	} catch (error) {
		console.error('Ошибка при получении завучей:', error)
		res.status(500).json({ message: 'Ошибка при получении завучей' })
	}
}
// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
	const userId = req.user.id
	const { username, password, full_name } = req.body
	try {
		const fields = []
		const values = []
		let idx = 1

		if (username) {
			fields.push(`username = $${idx++}`)
			values.push(username)
		}
		if (full_name) {
			fields.push(`full_name = $${idx++}`)
			values.push(full_name)
		}
		if (password) {
			const hashed = await bcrypt.hash(password, 10)
			fields.push(`password = $${idx++}`)
			values.push(hashed)
		}
		if (fields.length === 0) {
			return res.status(400).json({ message: 'Нет полей для обновления' })
		}
		values.push(userId)
		const query = `UPDATE users SET ${fields.join(
			', '
		)} WHERE id = $${idx} RETURNING id, username, full_name, role`
		const result = await pool.query(query, values)
		res.json({ user: result.rows[0] })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Ошибка обновления профиля' })
	}
}
exports.updateCredentials = async (req, res) => {
	const userId = req.user.id
	const { currentPassword, newUsername, newPassword } = req.body

	if (!currentPassword || (!newUsername && !newPassword)) {
		return res.status(400).json({ message: 'Недостаточно данных' })
	}

	try {
		const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [
			userId,
		])

		const user = userRes.rows[0]
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' })
		}
		const isMatch = await bcrypt.compare(currentPassword, user.password)
		if (!isMatch) {
			return res.status(401).json({ message: 'Неверный текущий пароль' })
		}

		if (newUsername && newUsername !== user.username) {
			const check = await pool.query(
				'SELECT * FROM users WHERE username = $1',
				[newUsername]
			)
			if (check.rows.length > 0) {
				return res.status(409).json({ message: 'Такой логин уже занят' })
			}
		}

		let hashed = user.password
		if (newPassword) {
			hashed = await bcrypt.hash(newPassword, 10)
		}

		const updated = await pool.query(
			`UPDATE users
		   SET username = $1,
			   password = $2
		 WHERE id = $3
		 RETURNING id, username, role`,
			[newUsername || user.username, hashed, userId]
		)

		res.json({
			message: 'Данные успешно обновлены',
			user: updated.rows[0],
		})
	} catch (err) {
		console.error('Ошибка при обновлении логина/пароля:', err)
		res.status(500).json({ message: 'Не удалось обновить данные' })
	}
}