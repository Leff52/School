const express = require('express')
const router = express.Router()
const subjectController = require('../controllers/subjectController')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware.verifyToken, subjectController.getAllSubjects)
module.exports = router
