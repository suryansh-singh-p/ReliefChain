const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
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
    userType: {
        type: String,
        enum: ['user', 'ngo', 'admin'],
        required: true
    },
    ngoDetails: {
        isActive: {
            type: Boolean,
            default: false
        },
        location: {
            lat: {
                type: Number,
                required: function() {
                    return this.userType === 'ngo';
                }
            },
            lng: {
                type: Number,
                required: function() {
                    return this.userType === 'ngo';
                }
            }
        },
        assignedDemands: [String]
    }
});

module.exports = mongoose.model('User', userSchema); 