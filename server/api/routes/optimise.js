const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getOptimalRoute } = require('../utils/optimal-route');

router.post('/get-optimal-route', auth, async (req, res) => {
    try {
        const { ngo, demands } = req.body;

        if(!ngo || !demands || demands.length === 0){
            res.status(400).json({ message: 'Invalid request' });
            return;
        }

        const nodes = [
            { _id: ngo._id,
                lat: ngo.ngoDetails.location.lat,
                lng: ngo.ngoDetails.location.lng,  
            },
            ...demands.map(d => ({
                _id: d._id,
                lat: Number(d.location.split(',')[0]),
                lng: Number(d.location.split(',')[1]),
            }))
        ];

        const { orderedIds, totalDistance } = getOptimalRoute(nodes);
        res.json({ orderedIds, totalDistance });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to get optimal route' });
    }
})

module.exports = router;