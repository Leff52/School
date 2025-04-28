const pool = require('../../config/db.config')

exports.getAllPerformances = async (req, res) => {
	try {
		const result = await pool.query(`
      SELECT p.id, p.student_id, s.full_name AS student_name,
             p.subject_id, subj.name AS subject_name,
             p.quarter, p.grade
      FROM performance p
      JOIN students s ON p.student_id = s.id
      JOIN subjects subj ON p.subject_id = subj.id
      ORDER BY p.id
    `)
		res.json({ performances: result.rows })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Ошибка получения успеваемости' })
	}
}
