const db = require('../../config/db.config');
exports.getPerformanceBySubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    
    const query = `
      SELECT s.full_name AS student, p.grade 
      FROM performance p
      JOIN students s ON p.student_id = s.id
      WHERE p.subject_id = $1
      ORDER BY s.full_name
    `;
    
    const result = await db.query(query, [subjectId]);
    
    return res.status(200).json({ 
      performance: result.rows 
    });
  } catch (error) {
    console.error('Ошибка в getPerformanceBySubject:', error);
    return res.status(500).json({
      message: 'Ошибка при получении данных по предмету'
    });
  }
};
exports.getFailingByClass = async (req, res) => {
  try {
    const query = `
      SELECT s.class, COUNT(*) AS failing_count
      FROM students s
      JOIN performance p ON s.id = p.student_id
      WHERE p.grade < 3
      GROUP BY s.class
      ORDER BY s.class
    `;
    
    const result = await db.query(query);
    
    return res.status(200).json({ 
      failing: result.rows 
    });
  } catch (error) {
    console.error('Ошибка в getFailingByClass:', error);
    return res.status(500).json({
      message: 'Ошибка при получении данных о неуспевающих'
    });
  }
};
exports.getTeacherWithLowestPerformance = async (req, res) => {
  try {
    const query = `
      SELECT t.full_name, AVG(p.grade) AS avg_grade
      FROM teachers t
      JOIN teacher_subject ts ON t.id = ts.teacher_id
      JOIN performance p ON ts.subject_id = p.subject_id
      GROUP BY t.full_name
      ORDER BY avg_grade ASC
      LIMIT 1
    `;
    
    const result = await db.query(query);
    
    return res.status(200).json({ 
      lowest: result.rows[0] || null 
    });
  } catch (error) {
    console.error('Ошибка в getTeacherWithLowestPerformance:', error);
    return res.status(500).json({
      message: 'Ошибка при получении учителя с низкой успеваемостью'
    });
  }
};
exports.getAverageByClass = async (req, res) => {
  try {
    const query = `
      SELECT s.class, AVG(p.grade) AS avg_grade
      FROM students s
      JOIN performance p ON s.id = p.student_id
      GROUP BY s.class
      ORDER BY s.class
    `;
    
    const result = await db.query(query);
    
    return res.status(200).json({ 
      byClass: result.rows 
    });
  } catch (error) {
    console.error('Ошибка в getAverageByClass:', error);
    return res.status(500).json({
      message: 'Ошибка при получении средних оценок по классам'
    });
  }
};
exports.getClassWithHighestPerformance = async (req, res) => {
  try {
    const query = `
      SELECT s.class, AVG(p.grade) AS avg_grade
      FROM students s
      JOIN performance p ON s.id = p.student_id
      GROUP BY s.class
      ORDER BY avg_grade DESC
      LIMIT 1
    `;
    
    const result = await db.query(query);
    
    return res.status(200).json({ 
      highest: result.rows[0] || null 
    });
  } catch (error) {
    console.error('Ошибка в getClassWithHighestPerformance:', error);
    return res.status(500).json({
      message: 'Ошибка при получении класса с высокой успеваемостью'
    });
  }
};
exports.getClassWithLowestPerformance = async (req, res) => {
  try {
    const query = `
      SELECT s.class, AVG(p.grade) AS avg_grade
      FROM students s
      JOIN performance p ON s.id = p.student_id
      GROUP BY s.class
      ORDER BY avg_grade ASC
      LIMIT 1
    `;
    
    const result = await db.query(query);
    
    return res.status(200).json({ 
      lowest: result.rows[0] || null 
    });
  } catch (error) {
    console.error('Ошибка в getClassWithLowestPerformance:', error);
    return res.status(500).json({
      message: 'Ошибка при получении класса с низкой успеваемостью'
    });
  }
};