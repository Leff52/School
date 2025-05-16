const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
	isTeacher,
} = require('../middlewares/authMiddleware')
const sc = require('../controllers/studentController')

router.get('/', verifyToken, isZavuchOrAdmin, sc.getAllStudents)
router.post('/', verifyToken, isZavuchOrAdmin, sc.createStudent)
router.delete('/:id', verifyToken, isZavuchOrAdmin, sc.deleteStudent)
router.put('/:id', verifyToken, isZavuchOrAdmin, sc.updateStudent)
router.get('/all-for-teacher', verifyToken, isTeacher, sc.getAllStudents)
module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, sc.getStudentById)