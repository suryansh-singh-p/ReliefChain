const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDistance } = require('../utils/distance');

router.post('/', auth, async (req, res) => {
    try {
        const { unrespondedDemands, activeNGOs } = req.body;

        const assignments = [];

        for( let unrespondedDemand of unrespondedDemands){
            let closestNGO = null;
            let minDistance = Infinity;

            for( let ngo of activeNGOs){
                const dist = getDistance(Number(unrespondedDemand.location.split(',')[0]), Number(unrespondedDemand.location.split(',')[1]), Number(ngo.ngoDetails.location.lat), Number(ngo.ngoDetails.location.lng));

                if(dist < minDistance){
                    minDistance = dist;
                    closestNGO = ngo;
                }
            }
            if(closestNGO){
                assignments.push({
                    demandId: unrespondedDemand._id,
                    ngoId: closestNGO._id,
                    distance: minDistance
                });
            }
        }

        res.json({ assignments});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Assignment failed' });
    }
});
module.exports = router;