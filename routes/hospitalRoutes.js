const express = require ('express')
const router = express.Router()
const {login, register, forgotPassword, resetPassword, getPatients, getPatient, verifyHospital} = require('../controllers/hospital/hospitalController')

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password', resetPassword)
router.get('/patients', getPatients)
router.get('/patients/:id', getPatient)
router.patch('/verify', verifyHospital)

module.exports = router
