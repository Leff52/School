'use client'

import Link from 'next/link'
import { useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthContext } from '../app/providers'
import '../styles/header.css' 
import jwt_decode from 'jwt-decode'

export default function Header() {
    const { auth } = useContext(AuthContext)
    const pathname = usePathname()
    const router = useRouter()
    const getUserRole = () => {
        try {
            if (auth.token) {
                const decoded = jwt_decode(auth.token)
                return decoded.role
            }
        } catch (error) {
            console.error("Ошибка при декодировании токена:", error)
        }
        return null
    }
    
    const userRole = getUserRole()
    
    const getDashboardUrl = () => {
        if (userRole === 'TEACHER') {
            return '/teacher'
        } else {
            return '/cabinet'
        }
    }
    const isInDashboard = () => {
        return pathname === '/cabinet' || pathname === '/teacher'
    }

    const handleLogout = () => {
        auth.logout()
        router.push('/login')
    }

    return (
			<header className='main-header'>
				<div className='header-container'>
					<nav className='header-nav'>
						<Link href='/' className='header-logo'>
							Школа, школа, учиться целый год
						</Link>
					</nav>
					<div className='auth-container'>
						{auth.isAuthenticated ? (
							isInDashboard() ? (
								<button onClick={handleLogout} className='logout-button'>
									Выход
								</button>
							) : (
								<Link href={getDashboardUrl()} className='dashboard-link'>
									Личный кабинет
								</Link>
							)
						) : (
							<Link href='/login' className='login-link'>
								Вход
							</Link>
						)}
					</div>
				</div>

				<style jsx>{`
					.logout-button {
						background-color: #f44336;
						color: white;
						border: none;
						border-radius: 4px;
						padding: 8px 16px;
						font-size: 14px;
						cursor: pointer;
						font-weight: 500;
						transition: background-color 0.2s;
					}

					.logout-button:hover {
						background-color: #d32f2f;
					}

					.dashboard-link {
						color: white;
						text-decoration: none;
						padding: 8px 16px;
						background-color: rgba(255, 255, 255, 0.2);
						border-radius: 4px;
						font-weight: 500;
						transition: background-color 0.2s;
					}

					.dashboard-link:hover {
						background-color: rgba(255, 255, 255, 0.3);
					}

					.login-link {
						color: white;
						text-decoration: none;
						padding: 8px 16px;
						background-color: rgba(255, 255, 255, 0.2);
						border-radius: 4px;
						font-weight: 500;
						transition: background-color 0.2s;
					}

					.login-link:hover {
						background-color: rgba(255, 255, 255, 0.3);
					}
				`}</style>
			</header>
		)
}
