const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const tc = require('../controllers/teacherController')

router.get('/', verifyToken, isZavuchOrAdmin, tc.getAllTeachers)

module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, tc.getTeacherById)