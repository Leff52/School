'use client'
import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../providers'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const safeJsonParse = async response => {
	const text = await response.text()
	try {
		return JSON.parse(text)
	} catch (error) {
		console.error('Ошибка парсинга JSON:', error)
		console.log('Полученный текст:', text.substring(0, 100) + '...')
		throw new Error(
			`Некорректный ответ сервера: ${response.status} ${response.statusText}`
		)
	}
}
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Ошибка запроса, повторная попытка через ${delay}мс. Осталось попыток: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        throw error;
    }
};

export default function TeacherPage() {
    const { auth } = useContext(AuthContext)
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState('')
    const [creds, setCreds] = useState({
            currentPassword: '',
            newUsername: '',
            newPassword: '',
        })

    const groupedGrades = {}
    const [grades, setGrades] = useState([])
		const [editMap, setEditMap] = useState({}) 

		const [newGrade, setNewGrade] = useState({
			student_id: '',
			subject_id: '',
			quarter: 1,
			grade: 2,
		})
        const downloadFileWithToken = async (url, filename) => {
					try {
						const res = await fetch(url, {
							headers: { Authorization: `Bearer ${auth.token}` },
						})
						if (!res.ok) throw new Error('Ошибка скачивания файла')
						const blob = await res.blob()
						const link = document.createElement('a')
						link.href = window.URL.createObjectURL(blob)
						link.download = filename
						document.body.appendChild(link)
						link.click()
						link.remove()
					} catch (err) {
						alert('Ошибка скачивания: ' + err.message)
					}
				}
		const [students, setStudents] = useState([])
		const [subjects, setSubjects] = useState([])
		grades.forEach(g => {
			const key = `${g.subject}::${g.student}`
			if (!groupedGrades[key]) {
				groupedGrades[key] = {
					subject: g.subject,
					student: g.student,
					class: g.class,
					grades: {},
				}
			}
			groupedGrades[key].grades[g.quarter] = g.grade
		})
        const handleAddGrade = async e => {
					e.preventDefault()
					try {
						const res = await fetch(
							'http://localhost:5000/api/teachers/grade',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${auth.token}`,
								},
								body: JSON.stringify(newGrade),
							}
						)
						const data = await res.json()
						if (!res.ok) throw new Error(data.message)

						setGrades(prev => [...prev, data.performance])
						setNewGrade({
							student_id: '',
							subject_id: '',
							quarter: 1,
							grade: 2,
						})
					} catch (err) {
						alert('Ошибка при добавлении: ' + err.message)
					}
				}
        const handleEditGrade = async perfId => {
					try {
						const res = await fetch(
							`http://localhost:5000/api/teachers/grade/${perfId}`,
							{
								method: 'PUT',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${auth.token}`,
								},
								body: JSON.stringify({ grade: editMap[perfId] }),
							}
						)
						const data = await res.json()
						if (!res.ok) throw new Error(data.message)

						setGrades(prev =>
							prev.map(p =>
								p.id === perfId ? { ...p, grade: data.performance.grade } : p
							)
						)
						setEditMap(prev => ({ ...prev, [perfId]: '' }))
					} catch (err) {
						alert('Ошибка изменения: ' + err.message)
					}
				}
    
    const handleCredentialUpdate = async e => {
        e.preventDefault()
        try {
            const res = await fetch(
                'http://localhost:5000/api/users/update-credentials',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${auth.token}`,
                    },
                    body: JSON.stringify(creds),
                }
            )

            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            alert('Данные успешно обновлены')
            setCreds({ currentPassword: '', newUsername: '', newPassword: '' })
        } catch (err) {
            alert('Ошибка: ' + err.message)
        }
    }
    useEffect(() => {
    if (!auth.isAuthenticated) {
        router.replace('/login')
        return
    }

    const fetchData = async () => {
        try {
            const [profileRes, gradesRes] = await Promise.all([
                fetchWithRetry('http://localhost:5000/api/teachers/my-profile', {
                    headers: { Authorization: `Bearer ${auth.token}` },
                }),
                fetchWithRetry('http://localhost:5000/api/teachers/my-grades', {
                    headers: { Authorization: `Bearer ${auth.token}` },
                })
            ])
            
            if (!profileRes.ok) {
                throw new Error(`Не удалось загрузить профиль: ${profileRes.status}`)
            }
            
            if (!gradesRes.ok) {
                throw new Error(`Не удалось загрузить оценки: ${gradesRes.status}`)
            }
            
            const profileData = await safeJsonParse(profileRes)
            const gradesData = await safeJsonParse(gradesRes)
            
            setProfile(profileData.teacher)
            setGrades(gradesData.grades || [])
            
            const teacherId = profileData.teacher.id
            
            try {
                const [studentsRes, subjectsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/teachers/my-students`, { 
                        headers: { Authorization: `Bearer ${auth.token}` },
                    }),
                    fetch(`http://localhost:5000/api/teachers/my-subjects`, { 
                        headers: { Authorization: `Bearer ${auth.token}` },
                    })
                ])
                
                const studentsData = studentsRes.ok ? await safeJsonParse(studentsRes) : { students: [] }
                const subjectsData = subjectsRes.ok ? await safeJsonParse(subjectsRes) : { subjects: [] }
                
                setStudents(studentsData.students || [])
                setSubjects(subjectsData.subjects || [])
            } catch (err) {
                console.warn('Ошибка при загрузке дополнительных данных:', err)
            }
            
        } catch (err) {
            console.error('Ошибка загрузки данных:', err)
            setError(err.message)
        }
    }

    fetchData()
}, [auth, router])

    useEffect(() => {
        const renewTokenExpiration = () => {
            const tokenExpiration = localStorage.getItem('tokenExpiration');
            if (tokenExpiration) {
                const newExpiration = Date.now() + 3600000;
                localStorage.setItem('tokenExpiration', newExpiration.toString());
            }
        };
        renewTokenExpiration();
        const handleActivity = () => renewTokenExpiration();
    
        window.addEventListener('click', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('mousemove', handleActivity);
        
        return () => {
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('mousemove', handleActivity);
        };
    }, []);

    if (error) return <p>Ошибка: {error}</p>
    if (!profile) return <p>Загрузка...</p>

    return (
			<div className='teacher-page'>
				<Header />

				<main className='main-content'>
					<div className='container'>
						<h1 className='page-title'>Кабинет учителя</h1>

						<section className='section profile-section'>
							<h2 className='section-title'>Профиль</h2>
							<div className='profile-details'>
								<p>
									<strong>ФИО:</strong> {profile.full_name}
								</p>
								<p>
									<strong>Кабинет:</strong> {profile.classroom}
								</p>
								<p>
									<strong>Предметы:</strong> {profile.subjects.join(', ')}
								</p>
							</div>
						</section>

						<section className='section credentials-section'>
							<h2 className='section-title'>Изменить логин и пароль</h2>
							<form
								onSubmit={handleCredentialUpdate}
								className='credentials-form'
							>
								<div className='form-group'>
									<label htmlFor='currentPassword'>Текущий пароль:</label>
									<input
										id='currentPassword'
										type='password'
										value={creds.currentPassword}
										onChange={e =>
											setCreds({ ...creds, currentPassword: e.target.value })
										}
										required
									/>
								</div>

								<div className='form-group'>
									<label htmlFor='newUsername'>Новый логин:</label>
									<input
										id='newUsername'
										type='text'
										value={creds.newUsername}
										onChange={e =>
											setCreds({ ...creds, newUsername: e.target.value })
										}
										placeholder='Оставьте пустым, если не меняется'
									/>
								</div>

								<div className='form-group'>
									<label htmlFor='newPassword'>Новый пароль:</label>
									<input
										id='newPassword'
										type='password'
										value={creds.newPassword}
										onChange={e =>
											setCreds({ ...creds, newPassword: e.target.value })
										}
										placeholder='Оставьте пустым, если не меняется'
									/>
								</div>

								<button type='submit' className='submit-button'>
									Сохранить
								</button>
							</form>
						</section>

						<section className='section grades-section'>
							<h2 className='section-title'>Оценки по моим предметам</h2>

							{Object.keys(groupedGrades).length > 0 ? (
								<div className='table-container'>
									<table className='grades-table'>
										<thead>
											<tr>
												<th>Предмет</th>
												<th>Ученик</th>
												<th>Класс</th>
												<th>Четверть 1</th>
												<th>Четверть 2</th>
												<th>Четверть 3</th>
												<th>Четверть 4</th>
											</tr>
										</thead>
										<tbody>
											{Object.values(groupedGrades).map((row, i) => (
												<tr key={i}>
													<td className='subject-cell'>{row.subject}</td>
													<td className='student-cell' title={row.student}>
														{row.student}
													</td>
													<td className='class-cell'>{row.class}</td>
													<td
														className={`grade-cell ${
															row.grades[1] ? 'has-grade' : ''
														}`}
														data-value={row.grades[1]}
													>
														{row.grades[1] || '-'}
													</td>
													<td
														className={`grade-cell ${
															row.grades[2] ? 'has-grade' : ''
														}`}
														data-value={row.grades[2]}
													>
														{row.grades[2] || '-'}
													</td>
													<td
														className={`grade-cell ${
															row.grades[3] ? 'has-grade' : ''
														}`}
														data-value={row.grades[3]}
													>
														{row.grades[3] || '-'}
													</td>
													<td
														className={`grade-cell ${
															row.grades[4] ? 'has-grade' : ''
														}`}
														data-value={row.grades[4]}
													>
														{row.grades[4] || '-'}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className='no-grades-message'>
									Оценки по вашим предметам отсутствуют или еще не загружены
								</div>
							)}
						</section>

						<section className='section editable-grades-section'>
							<h2 className='section-title'>Редактирование оценок</h2>

							{grades.length > 0 ? (
								<div className='table-container'>
									<table className='grades-table editable-grades-table'>
										<thead>
											<tr>
												<th>Ученик</th>
												<th>Предмет</th>
												<th>Класс</th>
												<th>Четверть</th>
												<th>Оценка</th>
												<th>Действия</th>
											</tr>
										</thead>
										<tbody>
											{grades.map((p, i) => (
												<tr key={i}>
													<td className='student-cell'>{p.student}</td>
													<td className='subject-cell'>{p.subject}</td>
													<td className='class-cell'>{p.class}</td>
													<td className='quarter-cell'>{p.quarter}</td>
													<td className='grade-edit-cell'>
														{editMap[p.id] !== undefined ? (
															<input
																type='number'
																min='2'
																max='5'
																value={editMap[p.id]}
																onChange={e =>
																	setEditMap({
																		...editMap,
																		[p.id]: Number(e.target.value),
																	})
																}
																className='grade-input'
															/>
														) : (
															<span className={`grade-value grade-${p.grade}`}>
																{p.grade}
															</span>
														)}
													</td>
													<td className='actions-cell'>
														{editMap[p.id] !== undefined ? (
															<button
																onClick={() => handleEditGrade(p.id)}
																className='save-button'
																title='Сохранить'
															>
																💾
															</button>
														) : (
															<button
																onClick={() =>
																	setEditMap({ ...editMap, [p.id]: p.grade })
																}
																className='edit-button'
																title='Редактировать'
															>
																✏️
															</button>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className='no-grades-message'>
									Оценки отсутствуют или еще не загружены
								</div>
							)}
						</section>

						<section className='section add-grade-section'>
							<h2 className='section-title'>Добавить оценку</h2>
							<form onSubmit={handleAddGrade} className='add-grade-form'>
								<div className='form-row'>
									<div className='form-group'>
										<label htmlFor='student-select'>Ученик:</label>
										<select
											id='student-select'
											value={newGrade.student_id}
											onChange={e =>
												setNewGrade({
													...newGrade,
													student_id: Number(e.target.value),
												})
											}
											required
											className='form-select'
										>
											<option value=''>-- Выберите ученика --</option>
											{students.length > 0 ? (
												students.map(s => (
													<option key={s.id} value={s.id}>
														{s.full_name}
													</option>
												))
											) : (
												<option value='' disabled>
													Загрузка учеников...
												</option>
											)}
										</select>
										{error && (
											<div className='error-message'>Ошибка: {error}</div>
										)}
									</div>

									<div className='form-group'>
										<label htmlFor='subject-select'>Предмет:</label>
										<select
											id='subject-select'
											value={newGrade.subject_id}
											onChange={e =>
												setNewGrade({
													...newGrade,
													subject_id: Number(e.target.value),
												})
											}
											required
											className='form-select'
										>
											<option value=''>-- Выберите предмет --</option>
											{subjects.map(s => (
												<option key={s.id} value={s.id}>
													{s.name}
												</option>
											))}
										</select>
									</div>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label htmlFor='quarter-select'>Четверть:</label>
										<select
											id='quarter-select'
											value={newGrade.quarter}
											onChange={e =>
												setNewGrade({
													...newGrade,
													quarter: Number(e.target.value),
												})
											}
											className='form-select quarter-select'
										>
											{[1, 2, 3, 4].map(q => (
												<option key={q} value={q}>
													Четверть {q}
												</option>
											))}
										</select>
									</div>

									<div className='form-group'>
										<label htmlFor='grade-input'>Оценка:</label>
										<input
											id='grade-input'
											type='number'
											min='2'
											max='5'
											value={newGrade.grade}
											onChange={e =>
												setNewGrade({
													...newGrade,
													grade: Number(e.target.value),
												})
											}
											required
											className='form-input grade-number-input'
										/>
									</div>

									<div className='form-group submit-group'>
										<button
											type='submit'
											className='submit-button add-grade-button'
										>
											Добавить оценку
										</button>
									</div>
								</div>
							</form>
						</section>
						<section className='section export-section'>
							<h2 className='section-title'>Экспорт оценок</h2>
							<div className='export-buttons'>
								<button
									onClick={() =>
										downloadFileWithToken(
											'http://localhost:5000/api/teachers/export/pdf',
											'perfomances52.pdf'
										)
									}
									className='export-button pdf-button'
								>
									<span className='button-icon'>📄</span>
									Скачать PDF
								</button>
								<button
									onClick={() =>
										downloadFileWithToken(
											'http://localhost:5000/api/teachers/export/csv',
											'perfomances52.csv'
										)
									}
									className='export-button csv-button'
								>
									<span className='button-icon'>📊</span>
									Скачать Excel
								</button>
							</div>
						</section>
					</div>
				</main>

				<Footer />

				<style jsx>{`
					.teacher-page {
						min-height: 100vh;
						display: flex;
						flex-direction: column;
						background-color: #f5f7fa;
					}

					.main-content {
						flex: 1;
						padding: 2rem 0;
					}

					.container {
						max-width: 1140px;
						margin: 0 auto;
						padding: 0 20px;
					}

					.page-title {
						color: #0070f3;
						margin-bottom: 1.5rem;
						font-size: 2rem;
						text-align: center;
					}

					.section {
						background-color: white;
						border-radius: 10px;
						box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
						padding: 1.5rem;
						margin-bottom: 2rem;
					}

					.section-title {
						color: #333;
						margin-top: 0;
						margin-bottom: 1.2rem;
						padding-bottom: 0.5rem;
						border-bottom: 1px solid #eee;
						font-size: 1.5rem;
					}

					.profile-details {
						color: #444;
						font-size: 1.1rem;
						line-height: 1.6;
					}

					.profile-details strong {
						color: #0070f3;
					}

					.credentials-form {
						max-width: 500px;
					}

					.form-group {
						margin-bottom: 1.2rem;
					}

					.form-group label {
						display: block;
						margin-bottom: 0.5rem;
						font-weight: 500;
						color: #333;
					}

					.form-group input {
						width: 100%;
						padding: 12px;
						border: 1px solid #ddd;
						border-radius: 4px;
						font-size: 16px;
						transition: border 0.3s, box-shadow 0.3s;
						color: #222;
					}

					.form-group input:focus {
						border-color: #0070f3;
						box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
						outline: none;
					}

					.submit-button {
						background-color: #0070f3;
						color: white;
						border: none;
						border-radius: 4px;
						padding: 12px 20px;
						font-size: 16px;
						font-weight: 600;
						cursor: pointer;
						transition: background-color 0.3s;
					}

					.submit-button:hover {
						background-color: #0051af;
					}

					.table-container {
						overflow-x: auto;
						margin-top: 1rem;
						border-radius: 8px;
						box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
					}

					.grades-table {
						width: 100%;
						border-collapse: collapse;
						font-size: 16px;
						min-width: 800px;
						background-color: white;
					}

					.grades-table th {
						background-color: #f0f0f0;
						color: #333;
						font-weight: 600;
						text-align: left;
						padding: 14px 16px;
						border-bottom: 2px solid #ddd;
						position: sticky;
						top: 0;
						z-index: 10;
					}

					.grades-table td {
						padding: 12px 16px;
						border-bottom: 1px solid #eee;
						line-height: 1.4;
					}

					.grades-table tbody tr:nth-child(even) {
						background-color: #f9f9f9;
					}

					.grades-table tbody tr:hover {
						background-color: #f0f7ff;
					}

					.subject-cell {
						font-weight: 600;
						color: #0070f3;
						min-width: 120px;
					}

					.student-cell {
						font-weight: 500;
						color: #000000;
						font-size: 17px;
						min-width: 250px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.class-cell {
						text-align: center;
						font-weight: 600;
						color: #333;
						width: 80px;
						background-color: #f7f7f7;
					}

					.grade-cell {
						text-align: center;
						width: 100px;
						font-size: 20px;
						font-weight: 600;
						color: #777;
					}

					.grade-cell.has-grade {
						font-weight: 700;
					}

					.grade-cell.has-grade:has([data-value='5']),
					.grade-cell:contains('5') {
						color: #4caf50;
						background-color: rgba(76, 175, 80, 0.05);
					}

					.grade-cell.has-grade:has([data-value='4']),
					.grade-cell:contains('4') {
						color: #2196f3;
						background-color: rgba(33, 150, 243, 0.05);
					}

					.grade-cell.has-grade:has([data-value='3']),
					.grade-cell:contains('3') {
						color: #ff9800;
						background-color: rgba(255, 152, 0, 0.05);
					}

					.grade-cell.has-grade:has([data-value='2']),
					.grade-cell:contains('2') {
						color: #f44336;
						background-color: rgba(244, 67, 54, 0.05);
					}

					.no-grades-message {
						padding: 20px;
						text-align: center;
						color: #666;
						font-style: italic;
						background-color: #f9f9f9;
						border-radius: 8px;
						margin-top: 1rem;
					}

					.grades-section {
						margin-top: 2.5rem;
					}

					/* Редактируемые оценки */
					.editable-grades-table .grade-edit-cell {
						width: 100px;
						text-align: center;
					}

					.grade-input {
						width: 60px;
						height: 40px;
						font-size: 18px;
						text-align: center;
						border: 2px solid #0070f3;
						border-radius: 4px;
						padding: 5px;
					}

					.grade-value {
						font-size: 20px;
						font-weight: 700;
						padding: 5px 10px;
						border-radius: 4px;
					}

					.grade-2 {
						color: #f44336;
					}
					.grade-3 {
						color: #ff9800;
					}
					.grade-4 {
						color: #2196f3;
					}
					.grade-5 {
						color: #4caf50;
					}

					.actions-cell {
						width: 80px;
						text-align: center;
					}

					.edit-button,
					.save-button {
						background: none;
						border: none;
						font-size: 20px;
						cursor: pointer;
						padding: 5px;
						border-radius: 4px;
						transition: background-color 0.2s;
					}

					.edit-button:hover {
						background-color: rgba(0, 0, 0, 0.05);
					}

					.save-button {
						background-color: rgba(0, 112, 243, 0.1);
					}

					.save-button:hover {
						background-color: rgba(0, 112, 243, 0.2);
					}

					.quarter-cell {
						text-align: center;
						font-weight: 500;
					}
					.add-grade-form {
						background-color: #f8fafc;
						border-radius: 8px;
						padding: 20px;
						margin-top: 15px;
					}

					.form-row {
						display: flex;
						flex-wrap: wrap;
						gap: 15px;
						margin-bottom: 15px;
					}

					.form-group {
						flex: 1;
						min-width: 200px;
					}

					.form-group label {
						display: block;
						margin-bottom: 8px;
						font-weight: 500;
						color: #333;
					}

					.form-select {
						width: 100%;
						padding: 10px 12px;
						border: 1px solid #ddd;
						border-radius: 4px;
						font-size: 16px;
						color: #333;
						background-color: white;
						transition: border-color 0.2s, box-shadow 0.2s;
					}

					.form-select:focus,
					.form-input:focus {
						border-color: #0070f3;
						box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
						outline: none;
					}

					.form-select:disabled {
						background-color: #f5f5f5;
						cursor: not-allowed;
					}

					.quarter-select {
						width: 100%;
					}

					.grade-number-input {
						width: 100%;
						padding: 10px;
						font-size: 16px;
						border: 1px solid #ddd;
						border-radius: 4px;
						text-align: center;
					}

					.submit-group {
						display: flex;
						align-items: flex-end;
					}

					.add-grade-button {
						width: 100%;
						background-color: #0070f3;
						color: white;
						border: none;
						border-radius: 4px;
						padding: 12px;
						font-weight: 600;
						cursor: pointer;
						transition: background-color 0.2s;
					}

					.add-grade-button:hover {
						background-color: #0051af;
					}

					.error-message {
						color: #f44336;
						font-size: 0.9rem;
						margin-top: 0.5rem;
						background-color: rgba(244, 67, 54, 0.05);
						padding: 5px 10px;
						border-radius: 4px;
						border-left: 3px solid #f44336;
					}

					.loading-spinner {
						margin: 20px auto;
						text-align: center;
					}

					@media (max-width: 768px) {
						.form-row {
							flex-direction: column;
						}

						.form-group {
							width: 100%;
						}
					}
					.export-section {
						margin-top: 2rem;
					}

					.export-buttons {
						display: flex;
						flex-wrap: wrap;
						gap: 1rem;
						margin-top: 1rem;
					}

					.export-button {
						padding: 12px 20px;
						border: none;
						border-radius: 6px;
						font-size: 16px;
						font-weight: 600;
						cursor: pointer;
						transition: all 0.2s ease;
						display: flex;
						align-items: center;
						justify-content: center;
						min-width: 200px;
						box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
					}

					.button-icon {
						margin-right: 10px;
						font-size: 18px;
					}

					.pdf-button {
						background-color: #e74c3c;
						color: white;
					}

					.pdf-button:hover {
						background-color: #c0392b;
						transform: translateY(-2px);
						box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
					}

					.csv-button {
						background-color: #27ae60;
						color: white;
					}

					.csv-button:hover {
						background-color: #219653;
						transform: translateY(-2px);
						box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
					}

					@media (max-width: 600px) {
						.export-buttons {
							flex-direction: column;
						}

						.export-button {
							width: 100%;
						}
					}
				`}</style>
			</div>
		)
}
