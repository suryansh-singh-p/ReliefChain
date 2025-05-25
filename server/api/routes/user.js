const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

// Register
router.post('/signup', async (req, res) => {
    try {
        const { username, password, userType, name, email, ngoDetails } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with appropriate ngoDetails
        const userData = {
            username,
            email,
            password: hashedPassword,
            userType,
            name,
            ngoDetails: {
                isActive: false,
                location: ngoDetails.location,
                assignedDemands: []
            }
        };

        user = new User(userData);
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password, userType } = req.body;

        // Validate request
        if (!username || !password || !userType) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify user type
        if (user.userType !== userType) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECURITY_KEY,
            { expiresIn: '24h' }
        );

        // Send response without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            userType: user.userType,
            ngoDetails: user.ngoDetails
        };

        res.json({ token, user: userResponse });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all NGO users
router.get('/ngo', auth, async (req, res) => {
    try {
        const ngos = await User.find({ userType: 'ngo' });
        res.json({ ngos });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user
router.patch('/:id', auth, async (req, res) => {
    try {
        const { ngoDetails } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ngoDetails },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 