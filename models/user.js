const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    employmentStatus: {
        type: String,
        required: true,
        enum: ['employed', 'unemployed']
    },
    phoneNumber: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true

    },
    city: {

        type: String,
        required: true
    },
    localGovernment: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    employer: {
        type: String,
        required: true,
        enum: ['private', 'government', 'ngo', 'other', 'self-employed']
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['verified', 'unverified'],
        default: 'unverified'
    },
    verified: {
        type: Boolean,
        default: false
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    package: {
        type: String,
        enum: ['Gold', 'Silver', 'Platinum'],
    },
    plan: {
        type: String,
        enum: ['individual', 'family', 'business', 'senior citizen'],
    },

},
    {timestamps: true}
)

const User = mongoose.model('User', UserSchema)

module.exports = User

