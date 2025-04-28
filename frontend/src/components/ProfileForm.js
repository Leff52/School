'use client'
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../app/providers'

export default function ProfileForm() {
	const { auth } = useContext(AuthContext)
	const [form, setForm] = useState({
		username: '',
		full_name: '',
		password: '',
	})
	const [message, setMessage] = useState('')
	const [status, setStatus] = useState('') // error

	useEffect(() => {
		const payload = JSON.parse(atob(auth.token.split('.')[1]))
		setForm({
			username: payload.username || '',
			full_name: payload.full_name || '',
			password: '',
		})
	}, [auth.token])

	const handleSubmit = async e => {
		e.preventDefault()
		setMessage('')
		setStatus('')

		try {
			const res = await fetch('http://localhost:5000/api/users/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify(form),
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.message || 'Ошибка')

			setMessage('Профиль успешно обновлён')
			setStatus('success')

			// Обновим токен, если поменяли username или password
		} catch (err) {
			setMessage(err.message)
			setStatus('error')
		}
	}

	return (
		<form onSubmit={handleSubmit} className='form'>
			{message && (
				<div
					className={status === 'success' ? 'success-message' : 'error-message'}
				>
					{message}
				</div>
			)}

			<div className='form-group'>
				<label htmlFor='username'>Имя пользователя:</label>
				<input
					id='username'
					value={form.username}
					onChange={e => setForm({ ...form, username: e.target.value })}
					required
					placeholder='Введите имя пользователя'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='full_name'>ФИО:</label>
				<input
					id='full_name'
					value={form.full_name}
					onChange={e => setForm({ ...form, full_name: e.target.value })}
					placeholder='Введите ваше полное имя'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='password'>Новый пароль:</label>
				<input
					id='password'
					type='password'
					value={form.password}
					onChange={e => setForm({ ...form, password: e.target.value })}
					placeholder='Оставьте пустым, чтобы не менять'
				/>
			</div>

			<button type='submit' className='submit-button'>
				Сохранить профиль
			</button>

			<style jsx>{`
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

				.success-message {
					background-color: #e8f5e9;
					color: #2e7d32;
					padding: 12px;
					border-radius: 4px;
					margin-bottom: 1.5rem;
					font-size: 14px;
				}

				.error-message {
					background-color: #ffebee;
					color: #d32f2f;
					padding: 12px;
					border-radius: 4px;
					margin-bottom: 1.5rem;
					font-size: 14px;
				}
			`}</style>
		</form>
	)
}
