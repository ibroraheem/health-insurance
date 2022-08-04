const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    }, 
    plan:{
        type: String,
        required: true
    },
    confirmationCode:{
        type: String,
        unique: true
    },
    status:{
        type: String,
        enum: ['verified', 'unverified'],
        default: 'unverified'
    },
    verified:{
        type: Boolean,
        default: false
    }

})

const User = mongoose.model('User', UserSchema)

module.exports = User