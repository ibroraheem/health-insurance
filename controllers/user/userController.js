const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Payment = require('../../models/payment')
const nodemailer = require('nodemailer')
const request = require('request')
const TMClient = require('textmagic-rest-client')
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
                id: user.id,
                name: user.name,
                role: user.role,
                verified: user.verified,
                plan: user.plan
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
                name: user.name,
                role: user.role,
                verified: user.verified,
                plan: user.plan
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
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
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
const changePassword = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(403).send("A token is required for this operation")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(403).send("A token is required for this operation")
    const { oldPassword, newPassword } = req.body
    try {
        const user = await User.findOne({ _id: decoded.user.id })
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashOld = bcrypt.hash(oldPassword, salt)
        const isMatch = bcrypt.compare(hashOld, user.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' })
        } else {
            user.password = await bcrypt.hash(newPassword, salt)
            user.save()
            res.status(200).json({ msg: 'Password changed' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const logout = async (req, res) => {
    try {
        let token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(403).send("A token is required for this operation")
        } else {
            token = jwt.sign({ token: token }, 'secret', { expiresIn: 1 })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}
const selectPlan = async (req, res) => {
    const token = req.header.authorization.split(' ')[1]
    if (!token) {
        return res.status(403).send("A token is required for this operation")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(403).send("A token is required for this operation")
    const { plan, package, amount } = req.body
    try {
        const user = await User.findOne({ _id: decoded.user.id })
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        await Payment.create({ user: user._id, amount: amount })
        user.plan = plan
        user.package = package
        user.save()
        res.status(200).json({ msg: 'Plan selected' })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const getPayments = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(403).send("A token is required for this operation")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(403).send("A token is required for this operation")
    try {
        const payment = await Payment.find({ user: decoded.user.id })
        if (!payment) {
            return res.status(400).json({ msg: 'Payment not found' })
        }
        res.status(200).json(payment)
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const verifyUser = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(403).send("A token is required for this operation")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) return res.status(403).send("A token is required for this operation")
    try {
        const user = await User.findOne({ _id: decoded.user.id })
        if (!user) {
            return res.status(400).json({ msg: 'User not found' })
        }
        const { firstName, lastName, bvn } = req.body
        if (!firstName || !lastName || !bvn) {
            return res.status(400).json({ msg: 'Please fill all the fields' })
        }
        const name = firstName + ' ' + lastName
        if (!name.includes(user.name)) {
            return res.status(400).json({ msg: 'Name does not match' })
        }
        if (bvn.length !== 11) {
            return res.status(400).json({ msg: 'BVN is not valid' })
        }
        request({
            url: 'https://api.myidentitypay.com/api/v2/biometrics/merchant/data/verification/bvn',
            method: 'POST',
            headers: {
                'x-api-key': process.env.ID_PASS_API_KEY,
                'app-id': process.env.APP_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: bvn,
            })
        }, (error, response, body) => {
            if (error) {
                return res.status(500).send('Server Error')
            }
            if (!response) return res.status(500).send('Server Error')
            const data = JSON.parse(body)
            if (data.response_code === 00 || data.status === true && data.bvn_data.firstName === firstName && data.bvn_data.lastName === lastName) {
                user.verified = true
                user.bvn = bvn
                user.save()
                res.status(200).json({ msg: 'BVN verified' })
            } else {
                return res.status(400).json({ msg: 'BVN not verified' })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}


module.exports = { register, login, forgotPassword, resetPassword, changePassword, logout, selectPlan, getPayments, verifyUser }