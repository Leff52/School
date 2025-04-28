const pool = require('../../config/db.config')

exports.getAllStudents = async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM students ORDER BY id')
		res.json({ students: result.rows })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Ошибка получения списка учеников' })
	}
}
// exports.getStudentById = async (req, res) => {
//     const { id } = req.params
//     try {
//         const result = await pool.query('SELECT * FROM students WHERE id = $1', [id])
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'Ученик не найден' })
//         }
//         res.json({ student: result.rows[0] })
//     } catch (err) {
//         console.error(err)
//         res.status(500).json({ message: 'Ошибка получения ученика' })
//     }
// }