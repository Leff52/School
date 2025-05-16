const pool = require('../config/db.config')
const bcrypt = require('bcrypt')

async function seedTeacherUsers() {
	try {
		console.log('Ищем учителей без user_id')

		const { rows: teachers } = await pool.query(`
      SELECT id, full_name
      FROM teachers
      WHERE user_id IS NULL
    `)

		if (teachers.length === 0) {
			console.log('✅ Все учителя уже имеют пользователей.')
			return
		}

		const password = 'teacher123' // общий стартовый пароль
		const hash = await bcrypt.hash(password, 10)

		for (const teacher of teachers) {
			const username = `teacher${teacher.id}`

			const userResult = await pool.query(
				`INSERT INTO users (username, password, role)
         VALUES ($1, $2, 'TEACHER') RETURNING id`,
				[username, hash]
			)
			const userId = userResult.rows[0].id
			await pool.query(`UPDATE teachers SET user_id = $1 WHERE id = $2`, [
				userId,
				teacher.id,
			])

			console.log(
				`👨‍🏫 Учителю ${teacher.full_name} → выдан username: ${username}`
			)
		}

		console.log('✅ Пользователи для учителей успешно созданы.')
	} catch (err) {
		console.error('❌ Ошибка при создании пользователей для учителей:', err)
	} finally {
		await pool.end()
	}
}

seedTeacherUsers()
