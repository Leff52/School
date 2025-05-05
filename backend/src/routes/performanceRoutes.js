const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const performanceController = require('../controllers/performanceController')

router.get(
	'/',
	verifyToken,
	isZavuchOrAdmin,
	performanceController.getAllPerformances
)

module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, tc.getTeacherById)