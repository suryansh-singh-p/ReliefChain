const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const demandEvents = require('./api/event/demandEvents');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const userRoutes = require('./api/routes/user');
const demandRoutes = require('./api/routes/demand');

// Use routes
app.use('/user', userRoutes);
app.use('/demand', demandRoutes);

// Create HTTP server
const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ['GET', 'POST', 'PATCH']
    }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Event emitters
demandEvents.on('demandCreated', (demand) => {
    io.emit('demandCreated', demand);
});

demandEvents.on('demandUpdated', (updatedDemand) => {
    io.emit('demandUpdated', updatedDemand);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});