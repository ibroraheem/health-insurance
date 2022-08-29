const express = require('express')
const router = express.Router()
const { login, register, forgotPassword, resetPassword, changePassword, logout, selectPlan, getPayments } = require('../controllers/user/userController')

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password', resetPassword)
router.patch('/change-password', changePassword)
router.post('/logout', logout)
router.patch('/select-plan', selectPlan)
router.get('/payments', getPayments)
module.exports = router