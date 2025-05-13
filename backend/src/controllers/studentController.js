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
// добавить ученика
exports.createStudent = async (req, res) => {
  const { full_name, class: studClass } = req.body;
  try {
    const sr = await pool.query(
      `INSERT INTO students (full_name, class)
         VALUES ($1, $2)
         RETURNING id, full_name, class`,
      [full_name, studClass]
    );
    res.status(201).json({ student: sr.rows[0] });
  } catch (err) {
    console.error('Ошибка создания ученика:', err);
    res.status(500).json({ message: 'Не удалось создать ученика' });
  }
};

//удалить ученика
exports.deleteStudent = async (req, res) => {
  const id = req.params.id;
  try {
    const dr = await pool.query(
      `DELETE FROM students WHERE id = $1 RETURNING *`,
      [id]
    );
    if (dr.rowCount === 0) {
      return res.status(404).json({ message: 'Ученик не найден' });
    }
    res.json({ message: 'Ученик удалён', student: dr.rows[0] });
  } catch (err) {
    console.error('Ошибка удаления ученика:', err);
    res.status(500).json({ message: 'Не удалось удалить ученика' });
  }
};