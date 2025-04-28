const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const sc = require('../controllers/studentController')

router.get('/', verifyToken, isZavuchOrAdmin, sc.getAllStudents)

module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, sc.getStudentById)