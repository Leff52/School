const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware')

// Эндпоинт для создания завуча (только для админа)
router.post('/create-zavuch', verifyToken, isAdmin, userController.createZavuch)
router.delete('/delete-zavuch/:id',verifyToken,isAdmin, userController.deleteZavuch)
module.exports = router
