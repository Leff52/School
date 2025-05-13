const pool = require('../../config/db.config')

exports.getAllPerformances = async (req, res) => {
	try {
		const result = await pool.query(`
select  s.full_name  as "Ученики",s2.name as "Дисциплина", p.quarter as "Четверть" ,p.grade as "Оценки"  from performance p
join students s on s.id = p.student_id 
join subjects s2 on s2.id = p.subject_id 
order by p.grade desc
    `)
		res.json({ performances: result.rows })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Ошибка получения успеваемости' })
	}
}
// PUT /api/performances/:id
exports.updatePerformance = async (req, res) => {
  const id = req.params.id;
  const { grade, quarter } = req.body;

  try {
    const result = await pool.query(
      `UPDATE performance
       SET grade = $1,
           quarter = $2
       WHERE id = $3
       RETURNING *`,
      [grade, quarter, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }

    res.json({ performance: result.rows[0] });
  } catch (error) {
    console.error('Ошибка при обновлении оценки:', error);
    res.status(500).json({ message: 'Не удалось обновить оценку' });
  }
};

exports.createPerformance = async (req, res) => {
  const { student_id, subject_id, quarter, grade } = req.body;
  try {
    const pr = await pool.query(
      `INSERT INTO performance (student_id, subject_id, quarter, grade)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
      [student_id, subject_id, quarter, grade]
    );
    res.status(201).json({ performance: pr.rows[0] });
  } catch (err) {
    console.error('Ошибка создания оценки:', err);
    res.status(500).json({ message: 'Не удалось добавить оценку' });
  }
};

exports.deletePerformance = async (req, res) => {
  const id = req.params.id;
  try {
    const dr = await pool.query(
      `DELETE FROM performance WHERE id = $1 RETURNING *`,
      [id]
    );
    if (dr.rowCount === 0) {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }
    res.json({ message: 'Оценка удалена', performance: dr.rows[0] });
  } catch (err) {
    console.error('Ошибка удаления оценки:', err);
    res.status(500).json({ message: 'Не удалось удалить оценку' });
  }
};