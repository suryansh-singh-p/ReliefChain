const EventEmitter = require('events');

class DemandEvents extends EventEmitter {}

const demandEvents = new DemandEvents();

module.exports = demandEvents; 