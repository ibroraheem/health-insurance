const mongoose = require('mongoose')
const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    
},
{ timestamps: true} 
)

const Payment = mongoose.model('Payment', PaymentSchema)
module.exports = Payment