const express = require('express')
const router = express.Router()
const { login, register, forgotPassword, resetPassword, getHospital, getHospitals, updateUser, getUsers, updateHospital, deleteHospital, deleteUser, revokeAccess, grantAccess } = require('../controllers/admin/adminController')

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password', resetPassword)
router.get('/hospitals', getHospitals)
router.get('/hospitals/:id', getHospital)
router.patch('/users/:id', updateUser)
router.get('/users', getUsers)
router.patch('/hospitals/:id', updateHospital)
router.delete('/hospitals/:id', deleteHospital)
router.delete('/users/:id', deleteUser)
router.patch('/users/:id', revokeAccess)
router.patch('/users/:id', grantAccess)
module.exports = router

