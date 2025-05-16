'use client'

import { createContext, useState, useEffect } from 'react'
import jwt_decode from 'jwt-decode'

export const AuthContext = createContext({
  auth: { isAuthenticated: false, token: null, user: null },
  isLoaded: false
})

export function Providers({ children }) {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        token: null,
        user: null
    })
    
    const [isLoaded, setIsLoaded] = useState(false)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkToken = () => {
                const savedToken = localStorage.getItem('authToken')
                const expirationTime = localStorage.getItem('tokenExpiration')
                
                if (savedToken && expirationTime) {
                    const currentTime = Date.now()
                    if (parseInt(expirationTime) > currentTime) {
                        try {
                            const decoded = jwt_decode(savedToken)
                            setAuthState({
                                isAuthenticated: true, 
                                token: savedToken,
                                user: {
                                    username: decoded.username,
                                    role: decoded.role
                                } 
                            })
                            
                            const timeLeft = parseInt(expirationTime) - currentTime
                            if (timeLeft < 600000) { // 10 минут
                                renewTokenExpiration()
                            }
                        } catch (error) {
                            console.error('Ошибка при проверке токена:', error)
                            localStorage.removeItem('authToken')
                            localStorage.removeItem('tokenExpiration')
                        }
                    } else {
                        localStorage.removeItem('authToken')
                        localStorage.removeItem('tokenExpiration')
                    }
                }
                setIsLoaded(true)
            }
            
            checkToken()
        }
    }, [])
    const renewTokenExpiration = () => {
        const newExpiration = Date.now() + 3600000 
        localStorage.setItem('tokenExpiration', newExpiration.toString())
    }

    const login = (token) => {
        try {
            const decoded = jwt_decode(token)
            localStorage.setItem('authToken', token)
            const expirationTime = Date.now() + 3600000 
            localStorage.setItem('tokenExpiration', expirationTime.toString())
            
            setAuthState({
                isAuthenticated: true,
                token,
                user: {
                    username: decoded.username,
                    role: decoded.role
                }
            })
            return true
        } catch (error) {
            console.error('Ошибка при логине:', error)
            return false
        }
    }

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('tokenExpiration')
        }
        
        setAuthState({
            isAuthenticated: false,
            token: null,
            user: null
        })
    }
    const auth = {
        ...authState,
        login,
        logout,
        renewTokenExpiration
    }

    return (
        <AuthContext.Provider value={{ auth, isLoaded }}>
            {children}
        </AuthContext.Provider>
    )
}

export default Providers
