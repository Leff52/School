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
