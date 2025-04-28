'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../providers'
import Link from 'next/link'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { setAuth } = useContext(AuthContext)
    const router = useRouter()

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Ошибка авторизации')
                return
            }

            // Сохраняем токен в localStorage
            localStorage.setItem('token', data.token)
            setAuth({ isAuthenticated: true, token: data.token })

            // Перенаправляем в личный кабинет
            router.push('/cabinet')
        } catch (err) {
            setError('Ошибка связи с сервером')
        }
    }

    return (
        <div className="login-page">
            <Header />
            
            <main className="main-content">
                <div className="login-container">
                    <h1 className="login-title">Вход в аккаунт</h1>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Имя пользователя</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                placeholder="Введите имя пользователя"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Пароль</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="Введите пароль"
                            />
                        </div>
                        
                        <button type="submit" className="login-button">Войти</button>
                    </form>
                </div>
            </main>
            
            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #f5f7fa;
                }
                
                .main-content {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem 1rem;
                }
                
                .login-container {
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                    padding: 2.5rem;
                    width: 100%;
                    max-width: 450px;
                }
                
                .login-title {
                    color: #0070f3;
                    text-align: center;
                    margin-bottom: 1.5rem;
                    font-size: 1.8rem;
                }
                
                .login-form {
                    display: flex;
                    flex-direction: column;
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
                    color: #222222; /* Добавлен темный цвет для вводимого текста */
                }
                
                /* Стили для placeholder */
                .form-group input::placeholder {
                    color: #555555;
                }
                .form-group input::-webkit-input-placeholder {
                    color: #555555;
                }
                .form-group input::-moz-placeholder {
                    color: #555555;
                    opacity: 1;
                }
                .form-group input:-ms-input-placeholder {
                    color: #555555;
                }
                .form-group input::-ms-input-placeholder {
                    color: #555555;
                }
                
                .form-group input:focus {
                    border-color: #0070f3;
                    box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
                    outline: none;
                }
                
                .login-button {
                    background-color: #0070f3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    margin-top: 1rem;
                }
                
                .login-button:hover {
                    background-color: #0051af;
                }
                
                .additional-links {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 1.5rem;
                    font-size: 14px;
                }
                
                .additional-links a {
                    color: #0070f3;
                    text-decoration: none;
                }
                
                .additional-links a:hover {
                    text-decoration: underline;
                }
                
                .error-message {
                    background-color: #ffebee;
                    color: #d32f2f;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 1.5rem;
                    font-size: 14px;
                    text-align: center;
                }
                
                @media (max-width: 500px) {
                    .login-container {
                        padding: 2rem 1.5rem;
                    }
                }
            `}</style>
        </div>
    )
}
