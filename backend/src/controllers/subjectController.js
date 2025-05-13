const pool = require('../../config/db.config');

exports.getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM subjects ORDER BY name ASC');
    res.json({ subjects: result.rows });
  } catch (err) {
    console.error('Ошибка получения предметов:', err);
    res.status(500).json({ message: 'Ошибка получения списка предметов' });
  }
};

exports.createSubject = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO subjects (name) VALUES ($1) RETURNING *`,
      [name]
    );
    res.status(201).json({ subject: result.rows[0] });
  } catch (err) {
    console.error('Ошибка создания предмета:', err);
    res.status(500).json({ message: 'Не удалось добавить предмет' });
  }
};