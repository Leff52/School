const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
	isTeacher,
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
router.get('/my-profile', verifyToken, isTeacher, tc.getTeacherProfile)
router.get('/my-grades', verifyToken, isTeacher, tc.getMyGrades)
router.post('/grade', verifyToken, isTeacher, tc.addGrade)
router.put('/grade/:id', verifyToken, isTeacher, tc.updateGrade)
router.get('/export/pdf', verifyToken, isTeacher, tc.exportToPDF)
router.get('/export/csv', verifyToken, isTeacher, tc.exportToCSV)
module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, tc.getTeacherById)