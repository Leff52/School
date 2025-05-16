const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware')

router.post('/create-zavuch', verifyToken, isAdmin, userController.createZavuch)
router.delete('/delete-zavuch/:id',verifyToken,isAdmin, userController.deleteZavuch)
router.get('/zavuchey', verifyToken, isAdmin, userController.getZavuchey)
router.put('/profile', verifyToken, userController.updateProfile)
router.put('/update-credentials', verifyToken, userController.updateCredentials)
module.exports = router
