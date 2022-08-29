const Admin = require('../../models/admin')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
require('dotenv').config()

const register = async (req, res) => {
    const { email, password } = req.body
    try {
        const isRegistered = await Admin.findOne({})
        if (isRegistered) {
            return res.status(400).json({ msg: 'Admin already exists' })
        }
        const newAdmin = new Admin({ email, password })
        const salt = await bcrypt.genSalt(10)
        newAdmin.password = await bcrypt.hash(password, salt)
        await newAdmin.save()
        const payload = {
            admin: {
                id: newAdmin.id,
                role: newAdmin.admin,
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }), (err, token) => {
            if (err) throw err
            res.json({ token })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }

}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(400).json({ msg: 'Admin not found' })
        }
        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        }
        const payload = {
            admin: {
                id: admin.id,
                role: admin.role
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err
            res.json({ token })
        }
        )
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(400).json({ msg: 'Admin not found' })
        }
        const payload = {
            admin: {
                id: admin.id
            }
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 })
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })
        const mailOptions = {
            from: '"Admin" <admin@health-insurance.com>',
            to: email,
            subject: 'Password Recovery',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
            Please click on the following link, or paste this into your browser to complete the process:
            http://localhost:3000/reset/${token}
            If you did not request this, please ignore this email and your password will remain unchanged.`
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err
            res.json({ msg: 'Email sent' })
        }
        )
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}
const resetPassword = async (req, res) => {
    const { password } = req.body
    try {
        const payload = jwt.verify(req.params.token, process.env.JWT_SECRET)
        const admin = await Admin.findById(payload.admin.id)
        if (!admin) {
            return res.status(400).json({ msg: 'Admin not found' })
        }
        const salt = await bcrypt.genSalt(10)
        admin.password = await bcrypt.hash(password, salt)
        await admin.save()
        res.json({ msg: 'Password changed' })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const getHospitals = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const hospitals = await Hospital.find({})
        res.json(hospitals)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}
const getHospital = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const hospital = await Hospital.findById(req.params.id)
        res.json(hospital)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const updateHospital = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json({ hospital, message: 'Hospital updated' })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const deleteHospital = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id)
        res.json({ hospital, message: 'Hospital deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const getUsers = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const users = await User.find({})
        res.json(users)
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const getUser = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const user = await User.findById(req.params.id)
        res.json(user)
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const updateUser = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json({ user, message: 'User updated' })
    }
    catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const deleteUser = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role === 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        res.json({ user, message: 'User deleted' })

    }
    catch (error) {

    }
}
const revokeAccess = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { verified: false }, { new: true })
        res.json({ user, message: 'User access revoked' })
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
}
const grantAccess = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ msg: 'Token is not valid' })
    if (decoded.admin.role !== 'admin') return res.status(401).json({ msg: 'You are not authorized to access this route' })
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true })
        res.json({ user, message: 'User access granted' })
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
}
module.exports = { register, login, forgotPassword, resetPassword, getHospital, getHospitals, getHospitals, deleteHospital, getUser, getUsers, updateUser, updateHospital, deleteUser, revokeAccess, grantAccess }

