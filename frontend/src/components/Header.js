'use client'

import Link from 'next/link'
import { useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthContext } from '../app/providers'

export default function Header() {
    const { auth, setAuth } = useContext(AuthContext)
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('token')
        setAuth({ isAuthenticated: false, token: null })
        router.push('/login')
    }

    return (
        <header className='header'>
            <div className='header-container'>
                <nav className='header-nav'>
                    <Link href='/' className='header-logo'>
                        Империя Зауча
                    </Link>
                </nav>
                <div className='auth-container'>
                    {auth.isAuthenticated ? (
                        // Если на странице кабинета, показываем кнопку "Выход"
                        pathname === '/cabinet' ? (
                            <button onClick={handleLogout} className='auth-link logout-link'>
                                Выход
                            </button>
                        ) : (
                            <Link href='/cabinet' className='auth-link cabinet-link'>
                                Личный кабинет
                            </Link>
                        )
                    ) : (
                        <Link href='/login' className='auth-link login-link'>
                            Вход
                        </Link>
                    )}
                </div>
            </div>

            <style jsx>{`
                .header {
                    background: #293133;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    padding: 15px 0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .header-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 20px;
                }

                .header-nav {
                    display: flex;
                    align-items: center;
                    gap: 40px;
                }

                .header-logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0070f3;
                    text-decoration: none;
                }

                .nav-links {
                    display: flex;
                    gap: 20px;
                }

                .nav-link {
                    color: #333;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.3s;
                }

                .nav-link:hover {
                    color: #0070f3;
                }

                .auth-container {
                    display: flex;
                    align-items: center;
                }

                .auth-link {

                    padding: 6px 8px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 400;
                    transition: all 0.3s;
                }
                
                .logout-link {
                    background: #e5;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .logout-link:hover {
                    background: #c62828;
                }

                .login-link {
                    background: #0070f3;
                    color: white;
                }

                .login-link:hover {
                    background: #0051af;
                }

                .cabinet-link {
                    background: #f0f0f0;
                    color: #333;
                }

                .cabinet-link:hover {
                    background: #e0e0e0;
                }
            `}</style>
        </header>
    )
}
