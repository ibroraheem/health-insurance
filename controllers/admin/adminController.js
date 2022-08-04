const Admin = require('../../models/admin')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
require('dotenv').config()

const register = async (req, res) => {
    const{email, password} = req.body
    try{
        const admin = await Admin.findOne({email})
        if(admin){
            return res.status(400).json({msg: 'Admin already exists'})
        }
        const newAdmin = new Admin({email, password})
        const salt = await bcrypt.genSalt(10)
        newAdmin.password = await bcrypt.hash(password, salt)
        await newAdmin.save()
        const payload = {
            admin: {
                id: newAdmin.id
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 360000}, (err, token) => {
            if(err) throw err
            res.json({token})
        }
        )
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const login = async (req, res) => {
    const{email, password} = req.body
    try{
        const admin = await Admin.findOne({email})
        if(!admin){
            return res.status(400).json({msg: 'Admin not found'})
        }
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch){
            return res.status(400).json({msg: 'Invalid credentials'})
        }
        const payload = {
            admin: {
                id: admin.id
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 360000}, (err, token) => {
            if(err) throw err
            res.json({token})
        }
        )
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

const forgotPassword = async (req, res) => {
    const{email} = req.body
    try{
        const admin = await Admin.findOne({email})
        if(!admin){
            return res.status(400).json({msg: 'Admin not found'})
        }
        const payload = {
            admin: {
                id: admin.id
            }
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 360000})
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
            if(err) throw err
            res.json({msg: 'Email sent'})
        }
        )
    } catch (error) {
        console.log(error)
        res.status(500).send('Server Error')
    }
}

module.exports = {register, login, forgotPassword}
