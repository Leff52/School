const express = require('express')
const router = express.Router()
const {
	verifyToken,
	isZavuchOrAdmin,
} = require('../middlewares/authMiddleware')
const pc = require('../controllers/performanceController')

router.get('/',verifyToken,isZavuchOrAdmin,pc.getAllPerformances)
router.post('/', verifyToken, isZavuchOrAdmin, pc.createPerformance)
router.delete('/:id', verifyToken, isZavuchOrAdmin, pc.deletePerformance)
router.put('/:id', verifyToken, isZavuchOrAdmin, pc.updatePerformance)
module.exports = router
// router.get('/:id', verifyToken, isZavuchOrAdmin, tc.getTeacherById)