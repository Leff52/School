export function isTokenValid() {
  const expiryTime = localStorage.getItem('auth_expiry')
  if (!expiryTime) return false
  
  const now = new Date().getTime()
  return now < parseInt(expiryTime)
}

export function getValidToken() {
  if (!isTokenValid()) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    return null
  }
  
  return localStorage.getItem('auth_token')
}

import { getValidToken } from '@/utils/auth'

const fetchTeachers = async () => {
  const token = getValidToken()
  if (!token) {
    router.replace('/login')
    return
  }

  try {
    const res = await fetch('http://localhost:5000/api/teachers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
  } catch (e) {
  }
}