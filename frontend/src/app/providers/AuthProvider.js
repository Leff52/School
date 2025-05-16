'use client'
import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  // чтобы избежать проблем с SSR в Next.js
  const [auth, setAuth] = useState({ isAuthenticated: false, token: null })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    //токен в localStorage
    const storedToken = localStorage.getItem('auth_token')
    const expiryTime = localStorage.getItem('auth_expiry')
    
    if (storedToken && expiryTime) {
      const now = new Date().getTime()
      if (now < parseInt(expiryTime)) {
        setAuth({
          token: storedToken,
          isAuthenticated: true
        })
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_expiry')
      }
    }
    
    setIsLoaded(true)
  }, [])

  const login = (token) => {
    //1 час
    const expiryTime = new Date().getTime() + (60 * 60 * 1000) 
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_expiry', expiryTime.toString())
    setAuth({
      token,
      isAuthenticated: true
    })
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    
    setAuth({
      token: null,
      isAuthenticated: false
    })
  }

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout,
      isLoaded 
    }}>
      {children}
    </AuthContext.Provider>
  )
}