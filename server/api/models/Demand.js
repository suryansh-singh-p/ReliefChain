const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema({
    itemname: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    ngoId: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'in-process', 'resolved'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Demand', demandSchema); 