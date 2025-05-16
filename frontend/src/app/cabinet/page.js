'use client'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileForm from '@/components/ProfileForm'
import jwt_decode from 'jwt-decode'

export default function CabinetPage() {
	const { auth, isLoaded } = useContext(AuthContext)
	const router = useRouter()
	useEffect(() => {
		const originalFetch = window.fetch;
		window.fetch = async function(...args) {
			try {
				const response = await originalFetch.apply(this, args);
				if (response.status === 404) {
					console.warn(`404 ошибка для: ${args[0]}`);
				}
				return response;
			} catch (err) {
				console.error(`Ошибка при запросе ${args[0]}:`, err);
				throw err;
			}
		};

		return () => {
			window.fetch = originalFetch; 
		};
	}, []);

	// Состояния для всех ролей
	const [userRole, setUserRole] = useState(null)
	const [error, setError] = useState(null)

	const [zavuchey, setZavuchey] = useState([])
	const [newUser, setNewUser] = useState({ username: '', password: '' })

	const [selectedTab, setSelectedTab] = useState('teachers')
	const [teachers, setTeachers] = useState([])
	const [students, setStudents] = useState([])
	const [performances, setPerformances] = useState([])
	const [editingStudentId, setEditingStudentId] = useState(null)
	const [editStudentData, setEditStudentData] = useState({
		full_name: '',
		class: '',
	})
	const [editingTeacherId, setEditingTeacherId] = useState(null)
	const [editTeacherData, setEditTeacherData] = useState({
		full_name: '',
		classroom: '',
		subjects: [],
	})
	const [subjectFilter, setSubjectFilter] = useState('')
	const [classFilter, setClassFilter] = useState('')
	const [studentFilter, setStudentFilter] = useState('')

	const [allSubjects, setAllSubjects] = useState([])
	const [subjects, setSubjects] = useState([])
	const [newTeacher, setNewTeacher] = useState({
		full_name: '',
		classroom: '',
		subjects: [],
	})
	const [newStudent, setNewStudent] = useState({ full_name: '', class: '' })
	const [perf, setPerf] = useState({
		student_id: '',
		subject_id: '',
		quarter: '',
		grade: '',
	})

	const [editingPerfId, setEditingPerfId] = useState(null)
	const [editPerfData, setEditPerfData] = useState({ grade: 2, quarter: 1 })
	const [saveSuccess, setSaveSuccess] = useState(false)
	const [analytics, setAnalytics] = useState({
		bySubject: [], 
		failing: [],
		teacherLowest: null, 
		avgByClass: [], 
		classHighest: null, 
		classLowest: null, 
	})
	const [subjectForAnalytics, setSubjectForAnalytics] = useState('')

	useEffect(() => {
		if (!isLoaded) {
			return 
		}

		if (!auth.isAuthenticated) {
			router.replace('/login')
			return
		}

		try {
			const decoded = jwt_decode(auth.token)
			setUserRole(decoded.role)
		} catch (err) {
			console.error('Ошибка декодирования токена', err)
			router.replace('/login')
		}
	}, [auth, router, isLoaded])

	const fetchZavuchey = async () => {
		try {
			const res = await fetch('http://localhost:5000/api/users/zavuchey', {
				headers: { Authorization: `Bearer ${auth.token}` },
			})
			const data = await res.json()
			setZavuchey(data.zavuchey)
		} catch (err) {
			console.error('Ошибка получения завучей', err)
		}
	}

	useEffect(() => {
		if (userRole === 'ADMIN') {
			fetchZavuchey()
		}
	}, [userRole])

	const handleDelete = async id => {
		try {
			const res = await fetch(
				`http://localhost:5000/api/users/delete-zavuch/${id}`,
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			)
			const data = await res.json()
			if (!res.ok) {
				setError(data.message || 'Ошибка удаления')
			} else {
				setZavuchey(zavuchey.filter(user => user.id !== id))
			}
		} catch (err) {
			console.error('Ошибка при удалении завуча', err)
		}
	}
	const handleSaveEditedTeacher = async id => {
		try {
			const res1 = await fetch(`http://localhost:5000/api/teachers/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify({
					full_name: editTeacherData.full_name,
					classroom: editTeacherData.classroom,
				}),
			})

			const data1 = await res1.json()
			if (!res1.ok) throw new Error(data1.message)
			const res2 = await fetch(
				`http://localhost:5000/api/teachers/${id}/subjects`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${auth.token}`,
					},
					body: JSON.stringify({ subjectIds: editTeacherData.subjects }),
				}
			)

			const data2 = await res2.json()
			if (!res2.ok) throw new Error(data2.message)
			setTeachers(prev =>
				prev.map(t =>
					t.id === id
						? {
								...t,
								full_name: editTeacherData.full_name,
								classroom: editTeacherData.classroom,
								subjects: subjects
									.filter(s => editTeacherData.subjects.includes(s.id))
									.map(s => s.name),
						  }
						: t
				)
			)

			setEditingTeacherId(null)
		} catch (err) {
			console.error('Ошибка при обновлении учителя:', err.message)
			setError(err.message)
		}
	}
	const handleSaveEditedStudent = async id => {
		try {
			const res = await fetch(`http://localhost:5000/api/students/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify(editStudentData),
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.message)

			setStudents(prev => prev.map(s => (s.id === id ? data.student : s)))

			setEditingStudentId(null)
		} catch (err) {
			console.error('Ошибка при обновлении ученика:', err.message)
			setError(err.message)
		}
	}
	const handleCreate = async e => {
		e.preventDefault()
		try {
			const res = await fetch('http://localhost:5000/api/users/create-zavuch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify(newUser),
			})
			const data = await res.json()
			if (!res.ok) {
				setError(data.message || 'Ошибка создания завуча')
			} else {
				setZavuchey([...zavuchey, data.user])
				setNewUser({ username: '', password: '' })
			}
		} catch (err) {
			console.error('Ошибка создания завуча', err)
		}
	}

	const fetchTeachers = async () => {
		try {
			const res = await fetch('http://localhost:5000/api/teachers', {
				headers: { Authorization: `Bearer ${auth.token}` },
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Ошибка загрузки учителей')
			}

			const data = await res.json()
			console.log('Данные учителей:', data)
			if (data.teachers && Array.isArray(data.teachers)) {
				const processedTeachers = data.teachers.map(teacher => ({
					...teacher,
					subjects: Array.isArray(teacher.subjects)
						? teacher.subjects
						: typeof teacher.subjects === 'string'
						? JSON.parse(teacher.subjects.replace('{', '[').replace('}', ']'))
						: [],
				}))

				setTeachers(processedTeachers)
			} else {
				setTeachers([])
			}
		} catch (e) {
			console.error('Ошибка при загрузке списка учителей:', e)
			setError(e.message || 'Ошибка загрузки учителей')
			setTeachers([])
		}
	}

	const fetchStudents = async () => {
		try {
			const res = await fetch('http://localhost:5000/api/students', {
				headers: { Authorization: `Bearer ${auth.token}` },
				})
			
			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.message || 'Ошибка загрузки учеников')
			}
			
			const validatedStudents = (data.students || []).map(student => ({
				...student,
				class: student.class || ''
			}))
			
			setStudents(validatedStudents)
			console.log('Загружены ученики с классами:', validatedStudents)
		} catch (e) {
			setError(e.message || 'Ошибка загрузки учеников')
			setStudents([])
		}
	}

	const fetchPerformances = async () => {
		setError(null)
		try {
			console.log('Запрашиваем данные успеваемости...')
			const res = await fetch('http://localhost:5000/api/performances', {
				headers: { Authorization: `Bearer ${auth.token}` },
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Ошибка загрузки успеваемости')
			}

			const data = await res.json()
			console.log('Получен ответ от API:', data)

			let rawPerformances = []
			if (data.performances) {
				rawPerformances = data.performances
			} else if (Array.isArray(data)) {
				rawPerformances = data
			} else {
				const possibleArrays = Object.values(data).find(val =>
					Array.isArray(val)
				)
				if (possibleArrays) rawPerformances = possibleArrays
			}

			const transformedPerformances = rawPerformances.map((perf, index) => ({
				id: perf.id || index + 1,
				student_name: perf['Ученики'],
				subject_name: perf['Дисциплина'],
				quarter: perf['Четверть'],
				grade: perf['Оценки'],
			}))

			console.log(
				'Преобразованные данные для отображения:',
				transformedPerformances
			)
			setPerformances(transformedPerformances)
		} catch (e) {
			console.error('Ошибка при загрузке успеваемости:', e)
			setError(e.message || 'Произошла ошибка при загрузке данных успеваемости')
			setPerformances([])
		}
	}

	const getUniqueSubjects = () => {
		const allSubjects = new Set()
		teachers.forEach(teacher => {
			if (teacher.subjects && teacher.subjects.length) {
				teacher.subjects.forEach(subject => {
					if (typeof subject === 'object' && subject !== null) {
						allSubjects.add(subject.name)
					} else {
						allSubjects.add(subject)
					}
				})
			}
		})
		return Array.from(allSubjects).sort()
	}
	const getUniqueClasses = () => {
		const validClasses = students
			.map(student => student.class)
			.filter(className => className !== null && className !== undefined);
		
		return [...new Set(validClasses)]
			.sort((a, b) => String(a).localeCompare(String(b)));
	}

	const getUniqueStudents = () => {
		return [...new Set(performances.map(p => p.student_name))].sort()
	}
	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				if (!auth?.token) {
					console.log('Токен отсутствует, пропускаем запрос subjects');
					return;
				}
			
				const res = await fetch('http://localhost:5000/api/subjects', {
					headers: { Authorization: `Bearer ${auth.token}` },
				});
				
				if (res.ok) {
					const data = await res.json();
					const formattedSubjects = (data.subjects || []).map(s => ({
						...s,
						id: String(s.id),
					}));
					setAllSubjects(formattedSubjects);
					setSubjects(formattedSubjects);
				} else {
					console.error('Ошибка загрузки предметов:', res.status);
				}
			} catch (err) {
				console.error('Ошибка при запросе subjects:', err);
			}
		}
		fetchSubjects()
	}, [auth.token])

	//Учителя
	const handleCreateTeacher = async e => {
		e.preventDefault()
		try {
			const res = await fetch('http://localhost:5000/api/teachers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify({
					...newTeacher,
					subjects: newTeacher.subjects,
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.message || 'Ошибка добавления учителя')
			setTeachers([...teachers, data.teacher])
			setNewTeacher({ full_name: '', classroom: '', subjects: [] })
		} catch (e) {
			setError(e.message)
		}
	}

	const handleDeleteTeacher = async id => {
		try {
			const res = await fetch(`http://localhost:5000/api/teachers/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${auth.token}` },
			})
			if (!res.ok) {
				const errData = await res.json()
				throw new Error(errData.message || 'Ошибка удаления учителя')
			}
			setTeachers(teachers.filter(t => t.id !== id))
		} catch (e) {
			setError(e.message)
		}
	}

	//Ученики
	const handleCreateStudent = async e => {
		e.preventDefault()
		try {
			const res = await fetch('http://localhost:5000/api/students', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify(newStudent),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.message || 'Ошибка добавления ученика')
			setStudents([...students, data.student])
			setNewStudent({ full_name: '', class: '' })
		} catch (e) {
			setError(e.message)
		}
	}

	const handleDeleteStudent = async id => {
		try {
			const res = await fetch(`http://localhost:5000/api/students/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${auth.token}` },
			})
			if (!res.ok) {
				const errData = await res.json()
				throw new Error(errData.message || 'Ошибка удаления ученика')
			}
			setStudents(students.filter(s => s.id !== id))
		} catch (e) {
			setError(e.message)
		}
	}

	// Успеваемость
	const handleCreatePerf = async e => {
		e.preventDefault()
		try {
			console.log('Отправка данных:', perf)
			const dataToSend = {
				...perf,
				subject_id: String(perf.subject_id),
				student_id: String(perf.student_id),
			}

			const res = await fetch('http://localhost:5000/api/performances', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify(dataToSend),
			})
			const data = await res.json()

			if (!res.ok) throw new Error(data.message || 'Ошибка добавления оценки')

			const newPerformance = {
				...data.performance,
				student_name:
					students.find(s => s.id === perf.student_id)?.full_name ||
					'Неизвестно',
				subject_name:
					subjects.find(s => s.id === perf.subject_id)?.name || 'Неизвестно',
			}

			setPerformances([...performances, newPerformance])
			setPerf({ student_id: '', subject_id: '', quarter: '', grade: '' })
		} catch (e) {
			console.error('Ошибка при добавлении оценки:', e)
			setError(e.message)
		}
	}

	const handleDeletePerformance = async id => {
		try {
			const res = await fetch(`http://localhost:5000/api/performances/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${auth.token}` },
			})
			if (!res.ok) {
				const errData = await res.json()
				throw new Error(errData.message || 'Ошибка удаления оценки')
			}
			setPerformances(performances.filter(p => p.id !== id))
		} catch (e) {
			setError(e.message)
		}
	}

	const handleSaveEditedPerformance = async (id) => {
		try {
			console.log('Отправляем на сервер ID:', id, 'типа:', typeof id);
			
			const dataToSend = {
				grade: Number(editPerfData.grade),
				quarter: Number(editPerfData.quarter)
			};
			
			const res = await fetch(`http://localhost:5000/api/performances/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`
				},
				body: JSON.stringify(dataToSend)
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Ошибка при обновлении оценки');
			setPerformances(prev => {
				return prev.map(p => p.id === id 
					? { ...p, grade: dataToSend.grade, quarter: dataToSend.quarter }
					: p
				);
			});
			
			setEditingPerfId(null);
			setSaveSuccess(id);
			setTimeout(() => setSaveSuccess(null), 2000);
			setTimeout(() => {
				fetchPerformances();
				if (selectedTab === 'analytics') {
					updateAllAnalytics();
				}
			}, 1000);
			
		} catch (err) {
			console.error('Ошибка при обновлении оценки:', err);
			setError(err.message);
		}
	};
	const updateAllAnalytics = () => {
		fetchAnalyticsFailing();
		fetchAnalyticsTeacherLowest();
		fetchAnalyticsAvgByClass();
		fetchAnalyticsClassHighest();
		fetchAnalyticsClassLowest();
		if (subjectForAnalytics) fetchAnalyticsSubject();
	};
//Аналитика
	const fetchAnalyticsSubject = async () => {
		try {
			const res = await fetch(
				`http://localhost:5000/api/analytics/subject/${subjectForAnalytics}`,
				{
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			)
			if (!res.ok) throw new Error((await res.json()).message)
			const { performance } = await res.json()
			setAnalytics(a => ({ ...a, bySubject: performance }))
		} catch (e) {
			setError(e.message)
		}
	}

	const fetchAnalyticsFailing = async () => {
		try {
			const res = await fetch('http://localhost:5000/api/analytics/failing', {
				headers: { Authorization: `Bearer ${auth.token}` },
			})
			if (!res.ok) throw new Error((await res.json()).message)
			const { failing } = await res.json()
			setAnalytics(a => ({ ...a, failing }))
		} catch (e) {
			setError(e.message)
		}
	}

	const fetchAnalyticsTeacherLowest = async () => {
		try {
			const res = await fetch(
				'http://localhost:5000/api/analytics/teacher/lowest',
				{
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			)
			if (!res.ok) throw new Error((await res.json()).message)
			const { lowest } = await res.json()
			setAnalytics(a => ({ ...a, teacherLowest: lowest }))
		} catch (e) {
			setError(e.message)
		}
	}

	const fetchAnalyticsAvgByClass = async () => {
		try {
			const res = await fetch(
				'http://localhost:5000/api/analytics/class/average',
				{
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			)
			if (!res.ok) throw new Error((await res.json()).message)
			const { byClass } = await res.json()
			setAnalytics(a => ({ ...a, avgByClass: byClass }))
		} catch (e) {
			setError(e.message)
		}
	}

	const fetchAnalyticsClassHighest = async () => {
		try {
			const res = await fetch(
				'http://localhost:5000/api/analytics/class/highest',
				{
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			)
			if (!res.ok) throw new Error((await res.json()).message)
			const { highest } = await res.json()
			setAnalytics(a => ({ ...a, classHighest: highest }))
		} catch (e) {
			setError(e.message)
		}
	}

	const fetchAnalyticsClassLowest = async () => {
		try {
			const res = await fetch(
				'http://localhost:5000/api/analytics/class/lowest',
				{
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			)
			if (!res.ok) throw new Error((await res.json()).message)
			const { lowest } = await res.json()
			setAnalytics(a => ({ ...a, classLowest: lowest }))
		} catch (e) {
			setError(e.message)
		}
	}

	useEffect(() => {
		if (userRole !== 'ZAVUCH') return

		setError(null)

		if (selectedTab === 'teachers') {
			console.log('Загружаем данные учителей')
			fetchTeachers()
		}
		if (selectedTab === 'students') {
			console.log('Загружаем данные учеников')
			fetchStudents()
		}
		if (selectedTab === 'performances') {
			console.log('Загружаем данные успеваемости')
			fetchPerformances()
		}
	}, [selectedTab, userRole])

	useEffect(() => {
		if (userRole === 'ZAVUCH' && selectedTab === 'analytics') {
			fetchAnalyticsFailing()
			fetchAnalyticsTeacherLowest()
			fetchAnalyticsAvgByClass()
			fetchAnalyticsClassHighest()
			fetchAnalyticsClassLowest()
		}
	}, [userRole, selectedTab])

	if (!isLoaded || !auth.isAuthenticated) {
		return <p>Загрузка...</p>
	}

	return (
		<div className='cabinet-page'>
			<Header />

			<main className='main-content'>
				<div className='container'>
					<h1 className='page-title'>Личный кабинет</h1>

					{error && <div className='error-message'>{error}</div>}

					{/*админ, отображаем панель для управления завучами */}
					{userRole === 'ADMIN' ? (
						<div className='admin-panel'>
							<section className='section'>
								<h2 className='section-title'>Список завучей</h2>
								{zavuchey.length > 0 ? (
									<div className='table-container'>
										<table className='data-table'>
											<thead>
												<tr>
													<th>ID</th>
													<th>Логин</th>
													<th>Действия</th>
												</tr>
											</thead>
											<tbody>
												{zavuchey.map(user => (
													<tr key={user.id}>
														<td>{user.id}</td>
														<td>{user.username}</td>
														<td>
															<button
																onClick={() => handleDelete(user.id)}
																className='delete-button'
																title='Удалить завуча'
															>
																 🗑
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<p className='empty-message'>Завучи не добавлены</p>
								)}
							</section>

							<section className='section'>
								<h2 className='section-title'>Добавление нового завуча</h2>
								<form onSubmit={handleCreate} className='form'>
									<div className='form-group'>
										<label htmlFor='username'>Имя пользователя:</label>
										<input
											id='username'
											type='text'
											value={newUser.username}
											onChange={e =>
												setNewUser({ ...newUser, username: e.target.value })
											}
											required
											placeholder='Введите логин'
										/>
									</div>
									<div className='form-group'>
										<label htmlFor='password'>Пароль:</label>
										<input
											id='password'
											type='password'
											value={newUser.password}
											onChange={e =>
												setNewUser({ ...newUser, password: e.target.value })
											}
											required
											placeholder='Введите пароль'
										/>
									</div>
									<button type='submit' className='submit-button'>
										Добавить завуча
									</button>
								</form>
							</section>
						</div>
					) : userRole === 'ZAVUCH' ? (
						<div className='zavuch-panel'>
							<section className='section'>
								<h2 className='section-title'>Панель управления</h2>

								{}
								<div className='tabs-navigation'>
									<button
										onClick={() => {
											setSelectedTab('teachers');
											fetchTeachers(); 
										}}
										className={`tab-button ${selectedTab === 'teachers' ? 'active' : ''}`}
									>
										Учителя
									</button>
									<button
										onClick={() => {
											setSelectedTab('students'); 
											fetchStudents(); 
										}}
										className={`tab-button ${selectedTab === 'students' ? 'active' : ''}`}
									>
										Ученики
									</button>
									<button
										onClick={() => {
											setSelectedTab('performances'); 
											fetchPerformances(); 
										}}
										className={`tab-button ${selectedTab === 'performances' ? 'active' : ''}`}
									>
										Успеваемость
									</button>
									<button
										onClick={() => {
											setSelectedTab('analytics');
											updateAllAnalytics(); 
										}}
										className={`tab-button ${selectedTab === 'analytics' ? 'active' : ''}`}
									>
										Аналитика
									</button>
								</div>

								{}
								<div className='tab-content'>
									{selectedTab === 'teachers' && (
										<div>
											<div className='filter-container'>
												<select
													value={subjectFilter}
													onChange={e => setSubjectFilter(e.target.value)}
													className='filter-select'
												>
													<option value=''>Все предметы</option>
													{getUniqueSubjects().map(subject => (
														<option key={subject} value={subject}>
															{subject}
														</option>
													))}
												</select>
											</div>

											<div className='records-count'>
												{subjectFilter
													? `Найдено учителей: ${
															teachers.filter(
																t =>
																	t.subjects &&
																	t.subjects.some(subject =>
																		typeof subject === 'object' &&
																		subject !== null
																			? subject.name === subjectFilter
																			: subject === subjectFilter
																	)
															).length
													  }`
													: `Всего учителей: ${teachers.length}`}
											</div>

											<div className='table-container'>
												{teachers && teachers.length > 0 ? (
													<table className='data-table'>
														<thead>
															<tr>
																 <th>ID</th>
																 <th>ФИО</th>
																 <th>Кабинет</th>
																 <th>Предметы</th>
																 <th>Действия</th>
															</tr>
														</thead>
														<tbody>
															{teachers
																  .filter(
																	teacher =>
																		!subjectFilter ||
																		(teacher.subjects &&
																			teacher.subjects.some(subject =>
																				typeof subject === 'object' &&
																				subject !== null
																					? subject.name === subjectFilter
																					: subject === subjectFilter
																				))
																	)
																  .map(teacher => (
																	<tr key={teacher.id}>
																		<td className="id-cell">{teacher.id}</td>
																		<td className="teacher-name-cell">
																			{editingTeacherId === teacher.id ? (
																				<input
																					type="text"
																					value={editTeacherData.full_name}
																					onChange={e =>
																						setEditTeacherData({ ...editTeacherData, full_name: e.target.value })
																					}
																					className="edit-input edit-name-input"
																				/>
																			) : (
																				teacher.full_name
																			)}
																		</td>
																		<td className="classroom-cell">
																			{editingTeacherId === teacher.id ? (
																				<input
																					type="text"
																					value={editTeacherData.classroom}
																					onChange={e =>
																						setEditTeacherData({ ...editTeacherData, classroom: e.target.value })
																					}
																					className="edit-input edit-class-input"
																				/>
																			) : (
																				teacher.classroom
																			)}
																		</td>
																		<td className="subjects-cell">
																			{editingTeacherId === teacher.id ? (
																				<div className="edit-subjects-container">
																					<div className="select-hint">Используйте Ctrl (или Cmd на Mac) для выбора нескольких предметов</div>
																					<select
																						multiple
																						value={editTeacherData.subjects}
																						onChange={e => setEditTeacherData({
																							...editTeacherData,
																							subjects: Array.from(e.target.selectedOptions, o => o.value)
																						})}
																						className="edit-subjects-select"
																						size="5"
																					>
																						{subjects.map(s => (
																							<option key={s.id} value={s.id}>
																								{s.name}
																							</option>
																						))}
																					</select>
																					{editTeacherData.subjects.length > 0 && (
																						<div className="selected-subjects">
																							<span>Выбрано: </span>
																							{editTeacherData.subjects.map(subjectId => {
																								const subject = subjects.find(s => s.id === subjectId);
																								return subject ? (
																									<span key={subject.id} className="selected-subject-tag">
																										{subject.name}
																									</span>
																								) : null;
																							})}
																						</div>
																					)}
																				</div>
																			) : (
																				teacher.subjects && teacher.subjects.length > 0 ? (
																					<ul className="subjects-list">
																						{teacher.subjects.map((subject, idx) => (
																							<li
																								key={`${teacher.id}-subject-${idx}`}
																								className={
																									(typeof subject === 'object' && subject !== null
																										? subject.name === subjectFilter
																										: subject === subjectFilter)
																										? 'highlighted-subject'
																										: ''
																								}
																							>
																								{typeof subject === 'object' && subject !== null
																									? subject.name || 'Неизвестный предмет'
																									: subject}
																							</li>
																						))}
																					</ul>
																				) : (
																					<span className="no-subjects">Не назначены</span>
																				)
																			)}
																		</td>
																		<td className="actions-cell">
																			{editingTeacherId === teacher.id ? (
																				<button 
																					onClick={() => handleSaveEditedTeacher(teacher.id)}
																					className="save-btn"
																					title="Сохранить изменения"
																				>💾</button>
																			) : (
																				<button
																					onClick={() => {
																						setEditingTeacherId(teacher.id);	
																						const selectedIds = subjects
																							.filter(s => {
																								return teacher.subjects?.some(teacherSubject => 
																									typeof teacherSubject === 'object' && teacherSubject !== null
																										? teacherSubject.name === s.name
																										: teacherSubject === s.name
																								);
																							})
																							.map(s => s.id);

																						setEditTeacherData({
																							full_name: teacher.full_name,
																							classroom: teacher.classroom,
																							subjects: selectedIds
																						});
																					}}
																					className="edit-btn"
																					title="Редактировать"
																				>✏️</button>
																			)}
																			<button 
																				onClick={() => handleDeleteTeacher(teacher.id)}
																				className="delete-button"
																				title="Удалить учителя"
																			>🗑</button>
																		</td>
																	</tr>
																))}
														</tbody>
													</table>
												) : (
													<p className='empty-message'>Список учителей пуст</p>
												)}
											</div>

											<form className='custom-form' onSubmit={handleCreateTeacher}>
												<input
													value={newTeacher.full_name}
													onChange={e => setNewTeacher({...newTeacher, full_name: e.target.value})}
													placeholder='ФИО'
													required
												/>
												<input
													value={newTeacher.classroom}
													onChange={e => setNewTeacher({...newTeacher, classroom: e.target.value})}
													placeholder='Кабинет'
													required
												/>
												<div className="select-container">
													<label className="select-label">Предметы (выберите один или несколько):</label>
													<div className="select-hint">Используйте Ctrl (или Cmd на Mac) для выбора нескольких предметов</div>
													<select
														multiple
														value={newTeacher.subjects}
														onChange={e => setNewTeacher({
															...newTeacher,
															subjects: Array.from(e.target.selectedOptions, opt => opt.value)
														})}
														className="subjects-multi-select"
														size="5"
													>
														{allSubjects.map(s => (
															<option key={s.id} value={s.id}>
																{s.name}
															</option>
														))}
													</select>
													{newTeacher.subjects.length > 0 && (
														<div className="selected-subjects">
															<span>Выбрано: </span>
															{newTeacher.subjects.map(subjectId => {
																const subject = allSubjects.find(s => s.id === subjectId);
																return subject ? (
																	<span key={subject.id} className="selected-subject-tag">
																		{subject.name}
																	</span>
																) : null;
															})}
														</div>
													)}
												</div>
												<button type='submit' className='submit-button'>
													Добавить учителя
												</button>
											</form>
										</div>
									)}

									{selectedTab === 'students' && (
										<div>
											<div className='filter-container'>
												<select
													value={classFilter}
													onChange={e => setClassFilter(e.target.value)}
													className='filter-select'
												>
													<option value=''>Все классы</option>
													{getUniqueClasses().map(className => (
														<option key={`class-${String(className)}`} value={String(className)}>
															{className}
														</option>
													))}
												</select>
											</div>

											<div className='records-count'>
												{classFilter
													? `Найдено учеников: ${
															students.filter(student => !classFilter || String(student.class || '') === String(classFilter)).length
													  }`
													: `Всего учеников: ${students.length}`}
											</div>

											<div className='table-container'>
												{students && students.length > 0 ? (
													<table className='data-table'>
														<thead>
															<tr>
																<th>ID</th>
																<th>ФИО</th>
																<th>Класс</th>
																<th>Действия</th>
															</tr>
														</thead>
														<tbody>
															{students
																.filter(student => !classFilter || String(student.class || '') === String(classFilter))
																.map(student => (
																	<tr key={student.id}>
																		<td className="id-cell">{student.id}</td>
																		<td className="student-name-cell">
																			{editingStudentId === student.id ? (
																				<input
																					type="text"
																					value={editStudentData.full_name}
																					onChange={e =>
																						setEditStudentData({ ...editStudentData, full_name: e.target.value })
																					}
																					className="edit-input edit-name-input"
																				/>
																			) : (
																				student.full_name
																			)}
																		</td>
																		<td className="class-cell">
																			{editingStudentId === student.id ? (
																				<input
																					type="text"
																					value={editStudentData.class || ''}
																					onChange={e =>
																						setEditStudentData({ ...editStudentData, class: e.target.value })
																					}
																					className="edit-input edit-class-input"
																				/>
																			) : (
																				student.class || '-'
																			)}
																		</td>
																		<td className="actions-cell">
																			{editingStudentId === student.id ? (
																				<button 
																					onClick={() => handleSaveEditedStudent(student.id)}
																					className="save-btn"
																					title="Сохранить изменения"
																				>💾</button>
																			) : (
																				<button
																					onClick={() => {
																						setEditingStudentId(student.id);
																						setEditStudentData({
																							full_name: student.full_name,
																							class: student.class
																						});
																					}}
																					className="edit-btn"
																					title="Редактировать"
																				>✏️</button>
																			)}
																			<button 
																				onClick={() => handleDeleteStudent(student.id)} 
																				className="delete-button"
																				title="Удалить ученика"
																			>🗑</button>
																		</td>
																	</tr>
																))}
														</tbody>
													</table>
												) : (
													<p className='empty-message'>Список учеников пуст</p>
												)}
											</div>

											<form
												className='custom-form'
												onSubmit={handleCreateStudent}
											>
												<input
													value={newStudent.full_name}
													onChange={e =>
														setNewStudent({
															...newStudent,
															full_name: e.target.value,
														})
													}
													placeholder='ФИО'
													required
												/>
												<input
													value={newStudent.class}
													onChange={e =>
														setNewStudent({
															...newStudent,
															class: e.target.value,
														})
													}
													placeholder='Класс'
													required
												/>
												<button type='submit' className='submit-button'>
													Добавить ученика
												</button>
											</form>
										</div>
									)}

									{selectedTab === 'performances' && (
										<div>
											<div className='filter-container'>
												<select
													value={studentFilter}
													onChange={e => setStudentFilter(e.target.value)}
													className='filter-select'
												>
													<option value=''>Все ученики</option>
													{getUniqueStudents().map(student => (
														<option key={student} value={student}>
															{student}
														</option>
													))}
												</select>
											</div>

											<div className='records-count'>
												{studentFilter
													? `Найдено записей: ${
															performances.filter(
																p => p.student_name === studentFilter
															).length
													  }`
													: `Всего записей: ${performances.length}`}
											</div>

											<div className='table-container'>
												{performances && performances.length > 0 ? (
													<table className='data-table'>
														<thead>
															<tr>
																<th>Ученик</th>
																<th>Предмет</th>
																<th>Четверть</th>
																<th>Оценка</th>
																<th>Действия</th>
															</tr>
														</thead>
														<tbody>
															{performances
																.filter(
																	p =>
																		!studentFilter ||
																		p.student_name === studentFilter
																)
																 .map(performance => (
																	<tr key={performance.id}>
																		<td className='student-cell'>
																			{editingPerfId === performance.id ? (
																				<select
																					value={editPerfData.student_id || ''}
																					onChange={e =>
																						setEditPerfData({ ...editPerfData, student_id: e.target.value })
																					}
																					className="edit-input"
																					required
																				>
																					<option value="">Выберите ученика</option>
																					{students.map(s => (
																						<option key={s.id} value={s.id}>
																							{s.full_name}
																						</option>
																					))}
																				</select>
																			) : (
																				performance.student_name
																			)}
																		</td>
																		<td className='subject-cell'>{performance.subject_name}</td>
																		<td className='quarter-cell'>
																			{editingPerfId === performance.id ? (
																				<input
																					type="number"
																					min="1"
																					max="4"
																					value={editPerfData.quarter}
																					onChange={e =>
																						setEditPerfData({ ...editPerfData, quarter: Number(e.target.value) })
																					}
																					className="edit-input"
																				/>
																			) : (
																				performance.quarter
																			)}
																		</td>
																		<td className={`grade-cell ${saveSuccess === performance.id ? 'save-highlight' : ''}`}>
																			{editingPerfId === performance.id ? (
																				<input
																					type="number"
																					min="2"
																					max="5"
																					value={editPerfData.grade}
																					onChange={e =>
																						setEditPerfData({ ...editPerfData, grade: Number(e.target.value) })
																					}
																					className="edit-input"
																				/>
																			) : (
																				performance.grade
																			)}
																		</td>
																		<td className='actions-cell'>
																			{editingPerfId === performance.id ? (
																				<button
																					className="save-btn"
																					onClick={() => handleSaveEditedPerformance(performance.id)}
																					title="Сохранить"
																				>💾</button>
																			) : (
																				<button
																					className="edit-btn"
																					onClick={() => {
																						setEditingPerfId(performance.id);
																						setEditPerfData({
																							grade: performance.grade,
																							quarter: performance.quarter,
																							student_id: students.find(s => s.full_name === performance.student_name)?.id || ''
																						});
																					}}
																					title="Редактировать"
																				>✏️</button>
																			)}
																			<button
																				className="delete-button"
																				onClick={() => handleDeletePerformance(performance.id)}
																				title="Удалить"
																			>🗑</button>
																		</td>
																	</tr>
																))}
														</tbody>
													</table>
												) : (
													<div className='empty-data-container'>
														<p className='empty-message'>
															Данные об успеваемости отсутствуют
														</p>
														<button
															onClick={() => {
																console.log('Обновляем данные успеваемости...')
																fetchPerformances()
															}}
															className='refresh-button'
														>
															Обновить данные
														</button>
													</div>
												)}
											</div>

											<form className='custom-form' onSubmit={handleCreatePerf}>
												<select
													value={perf.student_id}
													onChange={e =>
														setPerf({ ...perf, student_id: e.target.value })
													}
													required
												>
													<option value=''>Выберите ученика</option>
													{students.map(s => (
														<option key={s.id} value={s.id}>
															{s.full_name}
														</option>
													))}
												</select>
												<select
													value={perf.subject_id}
													onChange={e =>
														setPerf({ ...perf, subject_id: e.target.value })
													}
													required
													className='subject-select'
												>
													<option value='' className='placeholder-option'>
														Выберите предмет
													</option>
													{subjects && subjects.length > 0 ? (
														subjects.map(s => (
															<option key={s.id} value={String(s.id)}>
																{s.name}
															</option>
														))
													) : (
														<option disabled>Загрузка предметов...</option>
													)}
												</select>
												<input
													type='number'
													min='1'
													max='4'
													value={perf.quarter}
													onChange={e =>
														setPerf({ ...perf, quarter: e.target.value })
													}
													placeholder='Четверть'
													required
												/>
												<input
													type='number'
													min='2'
													max='5'
													value={perf.grade}
													onChange={e =>
														setPerf({ ...perf, grade: e.target.value })
													}
													placeholder='Оценка'
													required
												/>
												<button type='submit' className='submit-button'>
													Добавить оценку
												</button>
											</form>
										</div>
									)}

									{selectedTab === 'analytics' && (
										<div className='analytics'>
											<section>
												<h3>Успеваемость по предмету</h3>
												<div>
													<select
														value={subjectForAnalytics}
														onChange={e =>
															setSubjectForAnalytics(e.target.value)
														}
													>
														<option value=''>– выберите предмет –</option>
														{subjects.map(s => (
															<option key={s.id} value={s.id}>
																{s.name}
															</option>
														))}
													</select>
													<button onClick={fetchAnalyticsSubject}>
														Показать
													</button>
												</div>
												{analytics.bySubject.length > 0 && (
													<table>
														<thead>
															<tr>
																<th>Ученик</th>
																<th>Оценка</th>
															</tr>
														</thead>
														<tbody>
															{analytics.bySubject.map((p, i) => (
																<tr key={i}>
																	<td>{p.student}</td>
																	<td>{p.grade}</td>
																</tr>
															))}
														</tbody>
													</table>
												)}
											</section>

											<section>
												<h3>Количество неуспевающих по классам</h3>
												<table>
													<thead>
														<tr>
															<th>Класс</th>
															<th>Неуспевающих</th>
														</tr>
													</thead>
													<tbody>
														{analytics.failing.map((r, i) => (
															<tr key={i}>
																<td>{r.class}</td>
																<td>{r.failing_count}</td>
															</tr>
														))}
													</tbody>
												</table>
											</section>

											<section>
												<h3>Учитель с самой низкой успеваемостью</h3>
												{analytics.teacherLowest ? (
													<p>
														{analytics.teacherLowest.full_name} (ср. оценка{' '}
														{Number(analytics.teacherLowest.avg_grade).toFixed(
															2
														)}
														)
													</p>
												) : (
													<p>Данных нет</p>
												)}
											</section>

											<section>
												<h3>Средняя оценка по классам</h3>
												<table>
													<thead>
														<tr>
															<th>Класс</th>
															<th>Средняя</th>
														</tr>
													</thead>
													<tbody>
														{analytics.avgByClass.map((r, i) => (
															<tr key={i}>
																<td>{r.class}</td>
																<td>{Number(r.avg_grade).toFixed(2)}</td>
															</tr>
														))}
													</tbody>
												</table>
											</section>

											<section style={{ display: 'flex', gap: '2rem' }}>
												<div>
													<h3>Лучший класс</h3>
													{analytics.classHighest ? (
														<p>
															{analytics.classHighest.class} (
															{Number(analytics.classHighest.avg_grade).toFixed(
																2
															)}
															)
														</p>
													) : (
														<p>нет данных</p>
													)}
												</div>
												<div>
													<h3>Худший класс</h3>
													{analytics.classLowest ? (
														<p>
															{analytics.classLowest.class} (
															{Number(analytics.classLowest.avg_grade).toFixed(
																2
															)}
															)
														</p>
													) : (
														<p>нет данных</p>
													)}
												</div>
											</section>
										</div>
									)}
								</div>
							</section>

							<section className='section'>
								<h2 className='section-title'>Мой профиль</h2>
								<ProfileForm />
							</section>
						</div>
					) : (
						<div className='other-role-panel'>
							<p className='welcome-message'>
								Добро пожаловать! Ваша роль не распознана. Обратитесь к
								администратору.
							</p>
						</div>
					)}
				</div>
			</main>

			<Footer />

			<style jsx>{`
				.cabinet-page {
					min-height: 100vh;
					display: flex;
					flex-direction: column;
					background-color: #f5f7fa;
				}

				.main-content {
					flex: 1;
					padding: 2rem 1rem;
				}

				.container {
					max-width: 1200px;
					margin: 0 auto;
				}

				.page-title {
					color: #0070f3;
					margin-bottom: 1.5rem;
					font-size: 2rem;
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

				.data-table th {
					background-color: #f0f0f0;
					font-weight: 700;
					color: #222;
					position: sticky;
					top: 0;
					z-index: 10;
					text-align: center;
				}

				.student-cell {
					font-weight: 600;
					color: #333;
				}

				.grade-cell {
					font-weight: 800;
					font-size: 18px;
					color: #0070f3;
					text-align: center;
					background-color: #f0f8ff;
				}

				.quarter-cell {
					text-align: center;
					font-weight: 600;
				}
				.table-container {
					margin-bottom: 2rem;
					border-radius: 8px;
					box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
					overflow: hidden;
				}

				.data-table {
					width: 100%;
					border-collapse: collapse;
					font-size: 16px;
					border: 1px solid #eee;
				}

				.data-table th,
				.data-table td {
					padding: 12px;
					text-align: left;
				}

				.data-table td {
					color: #111111;
					font-weight: 500;
				}

				.data-table tr:nth-child(even) {
					background-color: #f5f7fa;
				}

				.data-table tr:nth-child(odd) {
					background-color: #ffffff;
				}

				.data-table tr:hover {
					background-color: #f0f7ff !important;
				}

				.delete-button {
					background: none;
					border: 1px solid #ffcdd2;
					border-radius: 4px;
					color: #e53935;
					font-size: 1rem;
					cursor: pointer;
					transition: all 0.2s;
					padding: 4px 8px;
					background-color: #fff0f0;
				}

				.delete-button:hover {
					background-color: #ffe6e6;
					transform: scale(1.1);
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
				}

				.actions-cell {
					text-align: center;
					width: 80px;
				}

				.form {
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

				.error-message {
					background-color: #ffebee;
					color: #d32f2f;
					padding: 12px;
					border-radius: 4px;
					margin-bottom: 1.5rem;
					font-size: 14px;
				}

				.empty-message {
					color: #666;
					font-style: italic;
					padding: 1rem 0;
				}

				.welcome-message {
					background-color: white;
					border-radius: 10px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
					padding: 2rem;
					text-align: center;
					font-size: 1.2rem;
					color: #333;
				}

				.tabs-navigation {
					display: flex;
					margin-bottom: 1.5rem;
					border-bottom: 1px solid #e0e0e0;
					overflow-x: auto;
					padding-bottom: 1px;
				}

				.tab-button {
					background: none;
					border: none;
					padding: 0.75rem 1.5rem;
					font-size: 1rem;
					font-weight: 500;
					color: #666;
					cursor: pointer;
					transition: all 0.3s;
					border-bottom: 2px solid transparent;
					margin-right: 0.5rem;
				}

				.tab-button:hover {
					color: #0070f3;
				}

				.tab-button.active {
					color: #0070f3;
					border-bottom: 2px solid #0070f3;
					font-weight: 600;
				}

				.tab-content {
					padding-top: 1rem;
				}

				.refresh-button {
					background-color: #0070f3;
					color: white;
					border: none;
					border-radius: 4px;
					padding: 8px 16px;
					font-size: 14px;
					font-weight: 500;
					cursor: pointer;
					transition: background-color 0.3s;
					margin-top: 10px;
				}

				.refresh-button:hover {
					background-color: #0051af;
				}

				.filter-container {
					margin-bottom: 1rem;
				}

				.filter-select {
					padding: 10px 15px;
					border-radius: 6px;
					border: 1px solid #ddd;
					background-color: white;
					font-size: 15px;
					color: #333;
					min-width: 250px;
					appearance: none;
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%230070f3' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
					background-repeat: no-repeat;
					background-position: calc(100% - 12px) center;
					padding-right: 30px;
					cursor: pointer;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
					transition: border-color 0.2s, box-shadow 0.2s;
				}

				.filter-select:focus {
					border-color: #0070f3;
					outline: none;
					box-shadow: 0 1px 3px rgba(0, 112, 243, 0.25);
				}

				.highlighted-subject {
					font-weight: 700;
					color: #0070f3;
				}

				.student-name-cell {
					width: 50%;
					padding: 10px 15px;
					font-weight: 600;
					color: #333;
				}

				.class-cell {
					width: 100px;
					text-align: center;
					font-weight: 600;
					background-color: #f0f8ff;
					color: #0070f3;
				}

				.subject-cell {
					font-weight: 500;
				}

				.records-count {
					margin-bottom: 0.5rem;
					font-size: 0.9rem;
					color: #666;
				}

				.custom-form {
					display: flex;
					flex-wrap: wrap;
					gap: 16px;
					margin-top: 24px;
					background: #f8fafc;
					padding: 18px 20px;
					border-radius: 10px;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
					align-items: center;
				}
				.custom-form input,
				.custom-form select {
					padding: 10px 14px;
					border-radius: 6px;
					border: 1px solid #d0d7de;
					font-size: 15px;
					min-width: 180px;
					background: #fff;
					color: #222; 
					font-weight: 600; 
					transition: border 0.2s, box-shadow 0.2s;
				}
				.custom-form input:focus,
				.custom-form select:focus {
					border-color: #0070f3;
					outline: none;
					box-shadow: 0 1px 3px rgba(0, 112, 243, 0.13);
				}
				.custom-form select[multiple] {
					min-height: 70px;
				}
				.custom-form .submit-button {
					background: linear-gradient(90deg, #0070f3 0%, #00c6ff 100%);
					color: #fff;
					border: none;
					border-radius: 6px;
					padding: 10px 22px;
					font-size: 16px;
					font-weight: 600;
					cursor: pointer;
					transition: background 0.2s, box-shadow 0.2s;
					box-shadow: 0 2px 8px rgba(0, 112, 243, 0.08);
				}
				.custom-form .submit-button:hover {
					background: linear-gradient(90deg, #0051af 0%, #0070f3 100%);
				}

				.subject-select,
				.custom-form select {
					color: #333;
					font-weight: 600;
				}

				.subject-select option,
				.custom-form select option {
					color: #222;
					font-weight: 500;
				}

				.subject-select option.placeholder-option,
				.custom-form select option.placeholder-option {
					color: #888 !important;
					font-weight: 700 !important;
					background: #f0f0f0;
				}

				.custom-form input::placeholder {
					color: #333;
					font-weight: 600;
					opacity: 1;
				}

				.custom-form select option:first-child,
				.subject-select option:first-child {
					font-weight: 800;
					color: #444;
					background-color: #f0f0f0;
					font-size: 1.05em;
				}

				.placeholder-option {
					font-weight: 800 !important;
					color: #333 !important;
					background: #f0f0f0;
				}

				.analytics {
					margin-top: 1.5rem;
					font-size: 1.08rem;
					color: #222;
					background: #f8fafc;
					border-radius: 12px;
					box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
					padding: 2rem 2.5rem;
				}

				.analytics section {
					margin-bottom: 2.2rem;
					background: #fff;
					padding: 1.2rem 1.5rem;
					border-radius: 8px;
					box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
				}

				.analytics h3 {
					margin-top: 0;
					margin-bottom: 1rem;
					font-size: 1.18rem;
					color: #0070f3;
					font-weight: 700;
					letter-spacing: 0.01em;
				}

				.analytics table {
					width: 100%;
					border-collapse: collapse;
					margin-top: 0.7rem;
					background: #f9fbfd;
					border-radius: 6px;
					overflow: hidden;
					font-size: 1.05rem;
				}

				.analytics th,
				.analytics td {
					border: 1px solid #e3e8ee;
					padding: 10px 14px;
					text-align: left;
				}

				.analytics th {
					background: #eaf3fb;
					color: #222;
					font-weight: 700;
					font-size: 1.07rem;
				}

				.analytics tr:nth-child(even) {
					background: #f5f7fa;
				}

				.analytics tr:nth-child(odd) {
					background: #fff;
				}

				.analytics tr:hover {
					background: #e0f0ff;
				}

				.analytics select,
				.analytics button {
					font-size: 1rem;
					padding: 8px 14px;
					border-radius: 6px;
					border: 1px solid #cfd8dc;
					margin-right: 0.7rem;
					margin-bottom: 0.5rem;
					background: #fff;
					color: #222;
					font-weight: 600;
					transition: border 0.2s, box-shadow 0.2s;
				}

				.analytics select:focus,
				.analytics button:focus {
					border-color: #0070f3;
					outline: none;
					box-shadow: 0 1px 3px rgba(0, 112, 243, 0.13);
				}

				.analytics button {
					background: linear-gradient(90deg, #0070f3 0%, #00c6ff 100%);
					color: #fff;
					border: none;
					font-weight: 700;
					cursor: pointer;
					transition: background 0.2s, box-shadow 0.2s;
				}

				.analytics button:hover {
					background: linear-gradient(90deg, #0051af 0%, #0070f3 100%);
				}

				.analytics p {
					font-size: 1.05rem;
					color: #333;
					margin: 0.5rem 0 0.5rem 0;
				}

				.id-cell {
					text-align: center;
					width: 60px;
					font-weight: 600;
					color: #555;
				}

				.edit-input {
					border: 2px solid #0070f3;
					border-radius: 5px;
					padding: 8px 12px;
					font-size: 16px;
					font-weight: 500;
					color: #222;
					background-color: #f5f9ff;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
					transition: all 0.2s ease;
				}

				.edit-input:focus {
					border-color: #0051af;
					box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
					outline: none;
				}

				.edit-name-input {
					width: 95%;
					min-width: 220px;
				}

				.edit-class-input {
					width: 80%;
					min-width: 60px;
					text-align: center;
				}

				.edit-btn, .save-btn {
					margin-right: 10px;
					padding: 5px 10px;
					border-radius: 5px;
					font-size: 16px;
					cursor: pointer;
					transition: all 0.2s;
					background-color: #f0f8ff;
				}

				.edit-btn:hover {
					background-color: #e1f0ff;
				}

				.save-btn {
					background-color: #e6ffee;
					color: #009e3a;
				}

				.save-btn:hover {
					background-color: #d0ffdf;
				}

				.save-highlight {
					background-color: #e6ffec !important;
					animation: fadeHighlight 2s;
				}

				@keyframes fadeHighlight {
					0% { background-color: #b4ffcb; }
					100% { background-color: #e6ffec; }
				}

				.edit-subjects-select {
					width: 100%;
					min-height: 100px;
					border: 2px solid #0070f3;
					border-radius: 5px;
					padding: 8px;
					font-size: 14px;
					background-color: #f5f9ff;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
				}

				.edit-subjects-select option {
					padding: 5px;
					border-bottom: 1px solid #e0e0e0;
				}

				.edit-subjects-select option:checked {
					background-color: #0070f3;
					color: white;
				}

				.subjects-list {
					margin: 0;
					padding: 0;
					list-style-type: none;
				}

				.subjects-list li {
					display: inline-block;
					margin: 2px 5px 2px 0;
					padding: 3px 8px;
					background-color: #e1f5fe;
					border-radius: 4px;
					font-size: 14px;
					color: #0277bd;
				}

				.no-subjects {
					color: #999;
					font-style: italic;
				}

				.highlighted-subject {
					font-weight: 700;
					color: #0070f3;
					background-color: #bbdefb;
				}

				.select-container {
					display: flex;
					flex-direction: column;
					min-width: 300px;
				}

				.select-label {
					font-weight: 600;
					margin-bottom: 4px;
					color: #333;
					font-size: 15px;
				}

				.select-hint {
					color: #666;
					font-size: 13px;
					margin-bottom: 6px;
					font-style: italic;
				}

				.subjects-multi-select {
					width: 100%;
					min-height: 120px;
					border: 2px solid #ddd;
					border-radius: 5px;
					padding: 8px;
					font-size: 15px;
					background-color: white;
					margin-bottom: 10px;
				}

				.subjects-multi-select:focus {
					border-color: #0070f3;
					outline: none;
					box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
				}

				.subjects-multi-select option {
					padding: 8px 10px;
					border-bottom: 1px solid #eee;
					cursor: pointer;
				}

				.subjects-multi-select option:checked {
					background-color: #e1f5fe;
					color: #0277bd;
					font-weight: bold;
				}

				.selected-subjects {
					margin-top: 5px;
					font-size: 14px;
					color: #333;
				}

				.selected-subject-tag {
					display: inline-block;
					background-color: #e1f5fe;
					color: #0277bd;
					padding: 3px 8px;
					border-radius: 4px;
					margin: 2px;
					font-weight: 500;
				}

				.edit-subjects-container {
					display: flex;
					flex-direction: column;
					width: 100%;
				}

				@media (max-width: 700px) {
					.analytics {
						padding: 1rem 0.5rem;
					}
					.analytics section {
						padding: 0.7rem 0.5rem;
					}
					.analytics table,
					.analytics th,
					.analytics td {
						font-size: 0.97rem;
						padding: 7px 6px;
					}
				}
			`}</style>
		</div>
	)
}
