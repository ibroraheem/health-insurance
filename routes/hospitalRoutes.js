const express = require ('express')
const router = express.Router()
const {login, register, forgotPassword, resetPassword} = require('../controllers/hospital/hospitalController')

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password', resetPassword)

module.exports = router
