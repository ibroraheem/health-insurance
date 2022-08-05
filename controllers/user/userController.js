const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
require('dotenv').config()

const register = async (req, res) => {
    const { name, email, password, address, employmentStatus, phoneNumber, state, city, localGovernment, employer, preferredHospital } = req.body
    try {
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ msg: 'User already exists' })
        }
        const newUser = new User({ name, email, password, address, employmentStatus, phoneNumber, state, city, localGovernment, employer, preferredHospital })
        const salt = await bcrypt.genSalt(10)
        newUser.password = await bcrypt.hash(password, salt)
        const payload = {
            user: {
                id: newUser.id,
                role: newUser.role
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 })
        //MAILER CODE WITH TOKEN HERE
        user.save()
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        }
        const payload = {
            user: {
                id: user.id,
                role: user.role
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
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        const payload = {
            user: {
                id: user.id,
                role: user.role
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

    const resetPassword = async (req, res) => {
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        if(!token){
            return res.status(403).send("A token is required for this operation")
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const { password } = req.body
        try {
            const user = await User.findOne({ _id: decoded.user.id })
            if (!user) {
                return res.status(400).json({ msg: 'User not found' })
            }
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            user.save()
        } catch (error) {
            console.log(error)
            res.status(500).send('Server Error')
        }
    }

    module.exports = { register, login, forgotPassword, resetPassword }