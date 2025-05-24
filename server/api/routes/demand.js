const express = require('express');
const router = express.Router();
const Demand = require('../models/demand');
const demandEvents = require('../event/demandEvents');
const auth = require('../middleware/auth');

// Get all demands
router.get('/', auth, async (req, res) => {
    try {
        const demands = await Demand.find();
        res.json({ demands });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// verified
router.get('/user/:username', auth, async (req, res) => {
    try {
        const demands = await Demand.find({ username: req.params.username });
        res.json({ demands });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// verified
router.get('/ngo/:ngoId', auth, async (req, res) => {
    try {
        const demands = await Demand.find({ ngoId: req.params.ngoId });
        res.json({ demands });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// verified
router.post('/', auth, async (req, res) => {
    try {
        const { itemname, quantity, location, contact, description, username, ngoId } = req.body;
        const demand = new Demand({
            itemname,
            quantity,
            location,
            contact,
            description,
            username,
            ngoId,
            status: 'pending'
        });
        await demand.save();
        demandEvents.emit('demandCreated', demand);
        res.status(201).json({ demand });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// verified
router.patch('/:id', auth, async (req, res) => {
    try {
        const { status, ngoId } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (ngoId) updateData.ngoId = ngoId;

        const demand = await Demand.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!demand) {
            return res.status(404).json({ message: 'Demand not found' });
        }

        demandEvents.emit('demandUpdated', demand);
        res.json({ demand });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 