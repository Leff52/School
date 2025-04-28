const pool = require('../../config/db.config')

exports.getAllTeachers = async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM teachers ORDER BY id')
		res.json({ teachers: result.rows })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Ошибка получения списка учителей' })
	}
}
// exports.getTeacherById = async (req, res) => {
//     const { id } = req.params
//     try {
//         const result = await pool.query('SELECT * FROM teachers WHERE id = $1', [
//             id,
//         ])
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'Учитель не найден' })
//         }
//         res.json({ teacher: result.rows[0] })
//     } catch (err) {
//         console.error(err)
//         res.status(500).json({ message: 'Ошибка получения учителя' })
//     }
// }