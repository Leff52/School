'use client'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileForm from '@/components/ProfileForm'
import jwt_decode from 'jwt-decode'

export default function CabinetPage() {
    const { auth } = useContext(AuthContext)
    const router = useRouter()
    const [userRole, setUserRole] = useState(null)
    const [zavuchey, setZavuchey] = useState([])
    const [newUser, setNewUser] = useState({ username: '', password: '' })
    const [error, setError] = useState(null)

    // Если не аутентифицирован, перенаправляем на страницу логина
    useEffect(() => {
        if (!auth.isAuthenticated) {
            router.replace('/login')
        } else {
            // Если токен есть, декодируем его для получения роли
            try {
                const decoded = jwt_decode(auth.token)
                setUserRole(decoded.role)
            } catch (err) {
                console.error('Ошибка декодирования токена', err)
            }
        }
    }, [auth, router])

    const fetchZavuchey = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/users/zavuchey', {
                headers: { Authorization: `Bearer ${auth.token}` }
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
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/delete-zavuch/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || 'Ошибка удаления')
            } else {
                // Обновляем список после удаления
                setZavuchey(zavuchey.filter(user => user.id !== id))
            }
        } catch (err) {
            console.error('Ошибка при удалении завуча', err)
        }
    }
    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:5000/api/users/create-zavuch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(newUser)
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

    if (!auth.isAuthenticated) {
        return <p>Загрузка...</p>
    }

    return (
			<div className='cabinet-page'>
				<Header />

				<main className='main-content'>
					<div className='container'>
						<h1 className='page-title'>Личный кабинет</h1>

						{error && <div className='error-message'>{error}</div>}

						{/* Если пользователь – админ, отображаем панель для управления завучами */}
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
						) : (
							<div className='zavuch-panel'>
								<p className='welcome-message'>
									Добро пожаловать! Здесь будет функционал для завучей (пока в
									разработке).
								</p>

								<section className='section'>
									<h2 className='section-title'>Мой профиль</h2>
									<ProfileForm />
								</section>
							</div>
						)}
					</div>
				</main>

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

					.table-container {
						overflow-x: auto;
					}

					.data-table {
						width: 100%;
						border-collapse: collapse;
						font-size: 16px; /* Увеличиваем размер шрифта */
					}

					.data-table th,
					.data-table td {
						padding: 12px;
						text-align: left;
					}

					.data-table th {
						background-color: #f0f0f0; /* Более выраженный фон для заголовков */
						font-weight: 700; /* Более жирный шрифт */
						color: #222; /* Темный цвет для заголовков */
					}

					.data-table td {
						color: #111111; /* Насыщенный черный для текста в ячейках */
						font-weight: 500; /* Делаем шрифт текста немного жирнее */
					}

					.data-table tr:nth-child(even) {
						background-color: #f5f7fa; /* Более выраженный фон для четных строк */
					}

					.data-table tr:nth-child(odd) {
						background-color: #ffffff; /* Явный белый фон для нечетных строк */
					}

					.data-table tr:hover {
						background-color: #e8f0fe; /* Более заметный эффект при наведении */
					}

					.delete-button {
						background: none;
						border: none;
						color: #e53935;
						font-size: 1.2rem;
						cursor: pointer;
						transition: transform 0.2s;
					}

					.delete-button:hover {
						transform: scale(1.2);
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
				`}</style>
			</div>
		)
}
