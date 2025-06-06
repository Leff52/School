import axios from 'axios'
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_expiry')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api