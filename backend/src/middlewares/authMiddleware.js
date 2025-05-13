const jwt = require('jsonwebtoken')
exports.verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res
			.status(401)
			.json({ message: 'Нет токена, авторизация запрещена' })
	}
	const token = authHeader.split(' ')[1]

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch (error) {
		res.status(401).json({ message: 'Неверный токен' })
	}
}

exports.isAdmin = (req, res, next) => {
	if (req.user.role !== 'ADMIN') {
		return res
			.status(403)
			.json({
				message: 'Доступ запрещен. Только админ может выполнять это действие',
			})
	}
	next()
}
exports.isZavuch = (req, res, next) => {
	if (req.user.role !== 'ZAVUCH') {
		return res
			.status(403)
			.json({ message: 'Доступ запрещён: нужен роль ZAVUCH' })
	}
	next()
}
exports.isZavuchOrAdmin = (req, res, next) => {
	if (!['ZAVUCH', 'ADMIN'].includes(req.user.role)) {
		return res.status(403).json({ message: 'Доступ запрещён' })
	}
	next()
}
exports.isUser = (req, res, next) => {
    if (req.user.role !== 'USER') {
        return res
            .status(403)
            .json({
                message: 'Доступ запрещен. Только пользователь может выполнять это действие',
            })
    }
    next()
}
