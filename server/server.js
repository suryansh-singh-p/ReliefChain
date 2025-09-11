const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const demandEvents = require('./api/event/demandEvents');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH']
}));
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
console.log(`MONGO_URL: ${MONGO_URL}`);
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const userRoutes = require('./api/routes/user');
const demandRoutes = require('./api/routes/demand');
const assignRoutes = require('./api/routes/assign');
const optimiseRoutes = require('./api/routes/optimise');

app.use('/user', userRoutes);
app.use('/demand', demandRoutes);
app.use('/assign', assignRoutes);
app.use('/optimise', optimiseRoutes);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PATCH']
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

demandEvents.on('demandCreated', (demand) => {
    io.emit('demandCreated', demand);
});

demandEvents.on('demandUpdated', (updatedDemand) => {
    io.emit('demandUpdated', updatedDemand);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;