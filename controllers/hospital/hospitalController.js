const Hospital = require('../../models/hospital')
const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
require('dotenv').config()

const register = async (req, res) => {
    const { name, email, password, address } = req.body
    try {
        const hospital = await Hospital.findOne({ email })
        if (hospital) {
            return res.status(400).json({ msg: 'Hospital already exists' })
        }
        const newHospital = new Hospital({ name, email, password, address })
        const salt = await bcrypt.genSalt(10)
        newHospital.password = await bcrypt.hash(password, salt)
        await newHospital.save()
        const payload = {
            hospital: {
                id: newHospital.id,
                role: newHospital.hospital,
                patients: newHospital.patients,
                verified: newHospital.verified
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err
            res.json({ token })
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const hospital = await Hospital.findOne({ email: email })
        if (!hospital) {
            return res.status(400).json({ msg: 'Hospital not found' })
        }
        const isMatch = await bcrypt.compare(password, hospital.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        }
        const payload = {
            hospital: {
                id: hospital.id,
                role: hospital.hospital,
                patients: hospital.patients,
                verified: hospital.verified
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err
            res.json({ token })
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const hospital = await Hospital.findOne({ email })
        if (!hospital) {
            return res.status(400).json({ msg: 'Hospital not found' })
        }
        const payload = {
            hospital: {
                id: hospital.id,
            }
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.eu',
                port: 465,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            })
            const mailOptions = {
                from: '"Admin" <admin@health-insurance.com>',
                to: email,
                subject: 'Reset Password',
                html: `<p>Please click the link below to reset your password</p>
                <a href="http://localhost:3000/hospital/reset-password/${token}">Reset Password</a>`
            }
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err
                res.json({ msg: 'Email sent' })
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const resetPassword = async (req, res) => {
    const bearerToken = req.headers.authorization.split(' ')[1]
    if (!bearerToken) {
        return res.status(400).json({ msg: 'No token provided' })
    }
    try {
        const { password } = req.body
        const { token } = req.params
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const hospital = await Hospital.findById(decoded.hospital.id)
        if (!hospital) {
            return res.status(400).json({ msg: 'Hospital not found' })
        }
        const salt = await bcrypt.genSalt(10)
        hospital.password = await bcrypt.hash(password, salt)
        await hospital.save()
        res.json({ msg: 'Password changed' })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const getPatients = async (req, res) => {
    const bearerToken = req.headers.authorization.split(' ')[1]
    if (!bearerToken) {
        return res.status(400).json({ msg: 'No token provided' })
    }
    try {

        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET)
        const hospital = await Hospital.findById(decoded.hospital.id)
        if (!hospital) {
            return res.status(400).json({ msg: 'Hospital not found' })
        }
        if (hospital.verified === false) {
            return res.status(400).json({ msg: 'Hospital not verified' })
        }
        const patients = await Hospital.findById(decoded.hospital.id).populate('patients')
        res.json(patients)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}
const getPatient = async (req, res) => {
    const bearerToken = req.headers.authorization.split(' ')[1]
    if (!bearerToken) {
        return res.status(400).json({ msg: 'No token provided' })
    }
    try {
        const { id } = req.params
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET)
        const hospital = await Hospital.findById(decoded.hospital.id)
        if (!hospital) {
            return res.status(400).json({ msg: 'Hospital not found' })
        }
        if (hospital.verified === false) {
            return res.status(400).json({ msg: 'Hospital not verified' })
        }
        const patient = await Hospital.findById(decoded.hospital.id).populate('patients').findOne({ _id: id })
        res.json(patient)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

module.exports = { register, login, forgotPassword, resetPassword, getPatients, getPatient }