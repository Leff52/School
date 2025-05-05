const pool = require('../config/db.config')

async function seed() {
	try {
		const subjectsList = [
			'Math',
			'Physics',
			'Chemistry',
			'Biology',
			'History',
			'Geography',
			'English',
			'Russian',
			'Literature',
			'ФИЗРА',
		]
		const subjectIds = {}
		for (const name of subjectsList) {
			// Сначала проверяем, есть ли такой предмет
			const qr = await pool.query('SELECT id FROM subjects WHERE name = $1', [
				name,
			])
			if (qr.rows.length) {
				subjectIds[name] = qr.rows[0].id
			} else {
				// Если нет — вставляем
				const ins = await pool.query(
					'INSERT INTO subjects (name) VALUES ($1) RETURNING id',
					[name]
				)
				subjectIds[name] = ins.rows[0].id
			}
		}
		const teachers = [
			{
				full_name: 'Титович Екатерина Владимировна',
				classroom: '17',
				subjects: ['Math', 'Physics'],
			},
			{
				full_name: 'Смирнова Марина Александровна',
				classroom: '18',
				subjects: ['Chemistry'],
			},
			{
				full_name: 'Нестерова Татьяна Вальерьевна',
				classroom: '24',
				subjects: ['Russian', 'Literature'],
			},
			{
				full_name: 'Новикова Татьяна Алексеевна',
				classroom: '18',
				subjects: ['Biology'],
			},
			{
				full_name: 'Журавкина Наталья Александровна',
				classroom: '48',
				subjects: ['History'],
			},
			{
				full_name: 'Кирилловская Ирина Борисовна',
				classroom: '44',
				subjects: ['Geography'],
			},
			{
				full_name: 'Прусакова Жанна Александровна',
				classroom: '52',
				subjects: ['English'],
			},
			{
				full_name: 'Звонков Сергей Николаевич',
				classroom: '28',
				subjects: ['ФИЗРА'],
			},
		]
		for (const t of teachers) {
			let tr = await pool.query(
				'SELECT id FROM teachers WHERE full_name = $1 AND classroom = $2',
				[t.full_name, t.classroom]
			)
			let teacherId
			if (tr.rows.length) {
				teacherId = tr.rows[0].id
			} else {
				const ins = await pool.query(
					'INSERT INTO teachers (full_name, classroom) VALUES ($1, $2) RETURNING id',
					[t.full_name, t.classroom]
				)
				teacherId = ins.rows[0].id
			}

			// связываем с предметами
			for (const subj of t.subjects) {
				const ts = await pool.query(
					'SELECT 1 FROM teacher_subject WHERE teacher_id = $1 AND subject_id = $2',
					[teacherId, subjectIds[subj]]
				)
				if (!ts.rows.length) {
					await pool.query(
						'INSERT INTO teacher_subject (teacher_id, subject_id) VALUES ($1, $2)',
						[teacherId, subjectIds[subj]]
					)
				}
			}
		}

		const students = [
			{ full_name: 'Сидоров Семён Семёнович', class: '10A' },
			{ full_name: 'Кузнецова Карина Карловна', class: '10A' },
			{ full_name: 'Алексеева Алина Александровна', class: '11Б' },
			{ full_name: 'Пихтвоников Лев Станиславович', class: '11Б' },
			{ full_name: 'Полосихин Илья Дмитриевич', class: '11Б' },
			{ full_name: 'Скрипкина Инна Дмитриевна', class: '10A' },
			{ full_name: 'Смирнова Наталья Шмоткина', class: '10A' },
		]
		const studentIds = []
		for (const s of students) {
			// проверяем существование
			let sr = await pool.query(
				'SELECT id FROM students WHERE full_name = $1 AND class = $2',
				[s.full_name, s.class]
			)
			let studentId
			if (sr.rows.length) {
				studentId = sr.rows[0].id
			} else {
				const ins = await pool.query(
					'INSERT INTO students (full_name, class) VALUES ($1, $2) RETURNING id',
					[s.full_name, s.class]
				)
				studentId = ins.rows[0].id
			}
			studentIds.push(studentId)
		}

		// оценки за четверть
		for (const studentId of studentIds) {
			for (const subjName of subjectsList) {
				const pr = await pool.query(
					'SELECT 1 FROM performance WHERE student_id=$1 AND subject_id=$2 AND quarter=1',
					[studentId, subjectIds[subjName]]
				)
				if (!pr.rows.length) {
					const grade = Math.floor(Math.random() * 4) + 2 // 2–5
					await pool.query(
						'INSERT INTO performance (student_id, subject_id, quarter, grade) VALUES ($1,$2,1,$3)',
						[studentId, subjectIds[subjName], grade]
					)
				}
			}
		}

		console.log(' Sample data successfully seeded')
	} catch (err) {
		console.error(' Error seeding data:', err)
	} finally {
		await pool.end()
	}
}

seed()
