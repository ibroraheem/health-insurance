const mongoose = require('mongoose');
const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'hospital'
    },
    verified: {
        type: Boolean,
        default: false
    },
    patients: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Patient'
    }
},
    { timestamps: true }
)

const Hospital = mongoose.model('Hospital', HospitalSchema)

module.exports = Hospital