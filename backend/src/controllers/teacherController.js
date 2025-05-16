const pool = require('../../config/db.config')
const bcrypt = require('bcrypt')
const { createObjectCsvStringifier } = require('csv-writer')
const PDFDocument = require('pdfkit')
const path = require('path')
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
exports.updateTeacherInfo = async (req, res) => {
  const id = req.params.id;
  const { full_name, classroom } = req.body;

  try {
    const result = await pool.query(
      `UPDATE teachers
       SET full_name = $1,
           classroom = $2
       WHERE id = $3
       RETURNING *`,
      [full_name, classroom, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Учитель не найден' });
    }

    res.json({ teacher: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении учителя:', err);
    res.status(500).json({ message: 'Не удалось обновить учителя' });
  }
};
exports.updateTeacherSubjects = async (req, res) => {
	const id = req.params.id
	const { subjectIds } = req.body 

	if (!Array.isArray(subjectIds)) {
		return res.status(400).json({ message: 'Ожидается массив subjectIds' })
	}

	try {

		await pool.query(`DELETE FROM teacher_subject WHERE teacher_id = $1`, [id])

		for (const subjId of subjectIds) {
			await pool.query(
				`INSERT INTO teacher_subject (teacher_id, subject_id) VALUES ($1, $2)`,
				[id, subjId]
			)
		}

		res.json({ message: 'Предметы обновлены' })
	} catch (err) {
		console.error('Ошибка при обновлении предметов учителя:', err)
		res.status(500).json({ message: 'Не удалось обновить предметы' })
	}
}
exports.getTeacherProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT t.id, t.full_name, t.classroom,
             ARRAY_AGG(s.name ORDER BY s.name) AS subjects
        FROM teachers t
        LEFT JOIN teacher_subject ts ON t.id = ts.teacher_id
        LEFT JOIN subjects s ON s.id = ts.subject_id
       WHERE t.user_id = $1
       GROUP BY t.id
       LIMIT 1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Учитель не найден' });
    }

    res.json({ teacher: result.rows[0] });
  } catch (err) {
    console.error('Ошибка получения профиля учителя:', err);
    res.status(500).json({ message: 'Ошибка получения профиля' });
  }
};
exports.getMyGrades = async (req, res) => {
	const userId = req.user.id

	try {
		const tr = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [
			userId,
		])
		const teacherId = tr.rows[0]?.id
		if (!teacherId) {
			return res.status(404).json({ message: 'Учитель не найден' })
		}
		const result = await pool.query(
			`
      SELECT
        p.id,
        s.full_name AS student,
        s.class AS class,
        subj.name AS subject,
        p.quarter,
        p.grade
      FROM teacher_subject ts
      JOIN subjects subj       ON ts.subject_id = subj.id
      JOIN performance p       ON p.subject_id = subj.id
      JOIN students s          ON s.id = p.student_id
     WHERE ts.teacher_id = $1
     ORDER BY subj.name, s.full_name, p.quarter
    `,
			[teacherId]
		)

		res.json({ grades: result.rows })
	} catch (err) {
		console.error('Ошибка получения оценок учителя:', err)
		res.status(500).json({ message: 'Не удалось получить оценки' })
	}
}
exports.addGrade = async (req, res) => {
	const userId = req.user.id
	const { student_id, subject_id, quarter, grade } = req.body

	if (!student_id || !subject_id || !quarter || !grade) {
		return res.status(400).json({ message: 'Все поля обязательны' })
	}

	try {
		const teacherRes = await pool.query(
			`SELECT id FROM teachers WHERE user_id = $1`,
			[userId]
		)
		const teacherId = teacherRes.rows[0]?.id

		if (!teacherId)
			return res.status(403).json({ message: 'Учитель не найден' })

		const check = await pool.query(
			`SELECT * FROM teacher_subject WHERE teacher_id = $1 AND subject_id = $2`,
			[teacherId, subject_id]
		)
		if (check.rows.length === 0) {
			return res.status(403).json({ message: 'Вы не преподаёте этот предмет' })
		}

		const result = await pool.query(
			`INSERT INTO performance (student_id, subject_id, quarter, grade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
			[student_id, subject_id, quarter, grade]
		)

		res.status(201).json({ performance: result.rows[0] })
	} catch (err) {
		console.error('Ошибка при добавлении оценки:', err)
		res.status(500).json({ message: 'Не удалось добавить оценку' })
	}
}
exports.updateGrade = async (req, res) => {
	const userId = req.user.id
	const performanceId = req.params.id
	const { grade } = req.body

	try {
		const teacherRes = await pool.query(
			`SELECT id FROM teachers WHERE user_id = $1`,
			[userId]
		)
		const teacherId = teacherRes.rows[0]?.id

		if (!teacherId)
			return res.status(403).json({ message: 'Учитель не найден' })

		const perfRes = await pool.query(
			`SELECT * FROM performance WHERE id = $1`,
			[performanceId]
		)
		const perf = perfRes.rows[0]

		if (!perf) return res.status(404).json({ message: 'Оценка не найдена' })

		const check = await pool.query(
			`SELECT * FROM teacher_subject WHERE teacher_id = $1 AND subject_id = $2`,
			[teacherId, perf.subject_id]
		)
		if (check.rows.length === 0) {
			return res.status(403).json({ message: 'Вы не преподаёте этот предмет' })
		}

		const updated = await pool.query(
			`UPDATE performance SET grade = $1 WHERE id = $2 RETURNING *`,
			[grade, performanceId]
		)

		res.json({ performance: updated.rows[0] })
	} catch (err) {
		console.error('Ошибка при обновлении оценки:', err)
		res.status(500).json({ message: 'Не удалось обновить оценку' })
	}
}

exports.exportToPDF = async (req, res) => {
	const userId = req.user.id

	try {
		const teacherRes = await pool.query(
			'SELECT id FROM teachers WHERE user_id = $1',
			[userId]
		)
		const teacherId = teacherRes.rows[0]?.id

		const dataRes = await pool.query(
			`
      SELECT s.full_name AS student, s.class, subj.name AS subject, p.quarter, p.grade
      FROM teacher_subject ts
      JOIN subjects subj ON ts.subject_id = subj.id
      JOIN performance p ON p.subject_id = subj.id
      JOIN students s ON s.id = p.student_id
      WHERE ts.teacher_id = $1
      ORDER BY subj.name, s.full_name, p.quarter
    `,
			[teacherId]
		)

		 const doc = new PDFDocument({
				font: path.join(__dirname, '../../fonts/DejaVuSans.ttf'),
			})
			doc.font(path.join(__dirname, '../../fonts/DejaVuSans.ttf'))
		res.setHeader('Content-Type', 'application/pdf')
		res.setHeader('Content-Disposition', 'attachment; filename="grades.pdf"')
		doc.pipe(res)

		doc.fontSize(18).text('Оценки по предметам', { align: 'center' }).moveDown()

		dataRes.rows.forEach((row, i) => {
			doc
				.fontSize(12)
				.text(
					`${row.subject} | ${row.student} (${row.class}) | Четверть ${row.quarter} → ${row.grade}`
				)
		})

		doc.end()
	} catch (err) {
		console.error('PDF ошибка:', err)
		res.status(500).json({ message: 'Ошибка экспорта PDF' })
	}
}

//excel
exports.exportToCSV = async (req, res) => {
	const userId = req.user.id

	try {
		const teacherRes = await pool.query(
			'SELECT id FROM teachers WHERE user_id = $1',
			[userId]
		)
		const teacherId = teacherRes.rows[0]?.id

		const dataRes = await pool.query(
			`
      SELECT s.full_name AS student, s.class, subj.name AS subject, p.quarter, p.grade
      FROM teacher_subject ts
      JOIN subjects subj ON ts.subject_id = subj.id
      JOIN performance p ON p.subject_id = subj.id
      JOIN students s ON s.id = p.student_id
      WHERE ts.teacher_id = $1
      ORDER BY subj.name, s.full_name, p.quarter
    `,
			[teacherId]
		)

		const csv = createObjectCsvStringifier({
			header: [
				{ id: 'subject', title: 'Предмет' },
				{ id: 'student', title: 'Ученик' },
				{ id: 'class', title: 'Класс' },
				{ id: 'quarter', title: 'Четверть' },
				{ id: 'grade', title: 'Оценка' },
			],
		})

		const output = csv.getHeaderString() + csv.stringifyRecords(dataRes.rows)

		res.setHeader('Content-Type', 'text/csv; charset=utf-8')
		res.setHeader('Content-Disposition', 'attachment; filename="grades.csv"')
		res.write('\uFEFF' + output) 
		res.end()
	} catch (err) {
		console.error('CSV ошибка:', err)
		res.status(500).json({ message: 'Ошибка экспорта CSV' })
	}
}
