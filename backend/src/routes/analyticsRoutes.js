const express = require('express');
const router = express.Router();

const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const ac = require('../controllers/analyticsController')

router.get(
	'/subject/:id',
	verifyToken,
	isZavuchOrAdmin,
	ac.getPerformanceBySubject
)

router.get('/failing', verifyToken, isZavuchOrAdmin, ac.getFailingByClass)

router.get(
	'/teacher/lowest',
	verifyToken,
	isZavuchOrAdmin,
	ac.getTeacherWithLowestPerformance
)

router.get('/class/average', verifyToken, isZavuchOrAdmin, ac.getAverageByClass)

router.get(
	'/class/highest',
	verifyToken,
	isZavuchOrAdmin,
	ac.getClassWithHighestPerformance
)

router.get(
	'/class/lowest',
	verifyToken,
	isZavuchOrAdmin,
	ac.getClassWithLowestPerformance
)
module.exports = router;
