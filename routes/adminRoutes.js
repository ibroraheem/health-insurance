const express = require('express')
const router = express.Router()
const {login, register, forgotPassword, resetPassword} = require('../controllers/admin/adminController')

router.post('/admin/register', register)
router.post('/admin/login', login)
router.post('/admin/forgot-password', forgotPassword)
router.patch('/admin/reset-password', resetPassword)

module.exports = router

