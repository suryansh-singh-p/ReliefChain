const EventEmitter = require('events');

class AllotEvent extends EventEmitter {}

const allotEvent = new AllotEvent();

module.exports = allotEvent; 