const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const authRoutes = require('./src/routes/authRoutes')
const userRoutes = require('./src/routes/userRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.listen(port, () => {
	console.log(`Сервер запущен на порту http://localhost:${port}`)
})
