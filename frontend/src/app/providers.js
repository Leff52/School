'use client'
import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export default function Providers({ children }) {
	const [auth, setAuth] = useState({
		isAuthenticated: false,
		token: null,
	})

	useEffect(() => {
		// При монтировании проверяем наличие токена в localStorage
		const token = localStorage.getItem('token')
		if (token) {
			setAuth({ isAuthenticated: true, token })
		}
	}, [])

	return (
		<AuthContext.Provider value={{ auth, setAuth }}>
			{children}
		</AuthContext.Provider>
	)
}
