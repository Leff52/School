const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const tc = require('../controllers/teacherController')

router.get('/', verifyToken, isZavuchOrAdmin, tc.getAllTeachers)
router.post('/', verifyToken, isZavuchOrAdmin, tc.createTeacher)
router.delete('/:id', verifyToken, isZavuchOrAdmin, tc.deleteTeacher)
router.put('/:id', verifyToken, isZavuchOrAdmin, tc.updateTeacherInfo)
router.patch(
	'/:id/subjects',
	verifyToken,
	isZavuchOrAdmin,
	tc.updateTeacherSubjects
)
module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, tc.getTeacherById)