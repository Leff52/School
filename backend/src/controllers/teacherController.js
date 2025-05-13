const pool = require('../../config/db.config')
const bcrypt = require('bcrypt')

exports.getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.full_name,
        t.classroom,
        COALESCE(
          ARRAY_AGG(s.name ORDER BY s.name) 
            FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS subjects
      FROM teachers t
      LEFT JOIN teacher_subject ts ON ts.teacher_id = t.id
      LEFT JOIN subjects s          ON s.id = ts.subject_id
      GROUP BY t.id, t.full_name, t.classroom
      ORDER BY t.id;
    `);
    res.json({ teachers: result.rows });
  } catch (err) {
    console.error('Ошибка получения списка учителей с предметами:', err);
    res.status(500).json({ message: 'Ошибка получения списка учителей' });
  }
};
// добавить нового учителя
exports.createTeacher = async (req, res) => {
  const { full_name, classroom, subjects } = req.body;
  try {
    const tr = await pool.query(
      `INSERT INTO teachers (full_name, classroom)
         VALUES ($1, $2)
         RETURNING id, full_name, classroom`,
      [full_name, classroom]
    );
    const teacher = tr.rows[0];
    if (Array.isArray(subjects)) {
      for (const subjId of subjects) {
        await pool.query(
          `INSERT INTO teacher_subject (teacher_id, subject_id)
             VALUES ($1,$2)`,
          [teacher.id, subjId]
        );
      }
    }
    const sbjRes = await pool.query(`
      SELECT s.id, s.name
        FROM teacher_subject ts
        JOIN subjects s ON s.id = ts.subject_id
       WHERE ts.teacher_id = $1
    `, [teacher.id]);

    res.status(201).json({
      teacher: { 
        ...teacher, 
        subjects: sbjRes.rows.map(r => ({ id:r.id, name:r.name })) 
      }
    });
  } catch (err) {
    console.error('Ошибка создания учителя:', err);
    res.status(500).json({ message: 'Не удалось создать учителя' });
  }
};

//удалить учителя
exports.deleteTeacher = async (req, res) => {
  const id = req.params.id;
  try {
    const dr = await pool.query(
      `DELETE FROM teachers WHERE id = $1 RETURNING *`,
      [id]
    );
    if (dr.rowCount === 0) {
      return res.status(404).json({ message: 'Учитель не найден' });
    }
    res.json({ message: 'Учитель удалён', teacher: dr.rows[0] });
  } catch (err) {
    console.error('Ошибка удаления учителя:', err);
    res.status(500).json({ message: 'Не удалось удалить учителя' });
  }
};