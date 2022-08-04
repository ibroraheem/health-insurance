const express = require('express')
const router = express.Router()
const {login, register, forgotPassword} = require('../controllers/admin/adminController')

router.post('/admin/register', register)
router.post('/admin/login', login)
router.post('/admin/forgot-password', forgotPassword)

module.exports = router

