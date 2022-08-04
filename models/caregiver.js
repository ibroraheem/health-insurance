const mongoose = require('mongoose');
const CareGiverSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    }, 
    password:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    type:{
        type: String,
        unique: true,
        enum: ['hospital', 'lab', 'pharmacy']
    }
    
})

const CareGiver = mongoose.model('CareGiver', CareGiverSchema)

module.exports = CareGiver