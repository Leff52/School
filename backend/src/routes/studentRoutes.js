const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const sc = require('../controllers/studentController')

router.get('/', verifyToken, isZavuchOrAdmin, sc.getAllStudents)
router.post('/', verifyToken, isZavuchOrAdmin, sc.createStudent)
router.delete('/:id', verifyToken, isZavuchOrAdmin, sc.deleteStudent)
module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, sc.getStudentById)