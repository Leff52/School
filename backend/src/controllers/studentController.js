const pool = require('../../config/db.config')

exports.getAllStudents = async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, full_name, class FROM students`)
        res.json({ students: result.rows })
    } catch (err) {
        res.status(500).json({ message: 'Ошибка получения учеников' })
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

// обновление ученика
exports.updateStudent = async (req, res) => {
  const id = req.params.id;
  const { full_name, class: studClass } = req.body;

  try {
    const result = await pool.query(
      `UPDATE students
       SET full_name = $1,
           class = $2
       WHERE id = $3
       RETURNING *`,
      [full_name, studClass, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ученик не найден' });
    }

    res.json({ student: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении ученика:', err);
    res.status(500).json({ message: 'Не удалось обновить ученика' });
  }
};