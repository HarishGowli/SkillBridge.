// backend/src/server.js

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io' // Removed unused import { Socket }
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser'
import sendEmail from './utils/emailService.js'; // Email utility

// Import the router files
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js'; 
import opportunityRouter from './routes/opportunities.js'; 
import applicationRouter from './routes/applications.js'
import chatRouter from './routes/chat.js'
// import { canChat } from './middleware/chat.js'
import { getRoomId } from './utils/getRoomId.js'
import Message from './models/Message.js'
import User from './models/User.js'

dotenv.config();
// connectDB() - Removed from here, moved to the bottom to ensure server starts after DB connection

const app = express()
const allowedOrigins = [
    "http://localhost:3000",
    "https://skillbridge-frontend-kt5o.onrender.com"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json())
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // Serve static files from 'uploads' directory

// THE AUTHENTICATION ROUTES 
app.use('/api/auth', authRouter);
// THE USER PROFILE ROUTES
app.use('/api/users', userRouter);
// THE OPPORTUNITY ROUTES
app.use('/api/opportunities', opportunityRouter);
// THE APPLICATIONS ROUTE
app.use('/api/applications/', applicationRouter)

app.use('/api/chats/',chatRouter)

app.get('/', (req, res) => {
    res.json('welcome to backend')
})

const server = http.createServer(app)


// Socket.IO Logic
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://skillbridge-frontend-kt5o.onrender.com"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Maps
const onlineUsers = new Map();       // userId → socketId
const onlineVolunteers = new Map();  // legacy support

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ---------------------------------------
    // 1) REGISTER USER
    // ---------------------------------------
    socket.on("registerUser", async (userId) => {
        if (!userId) return;

        socket.userId = userId;
        onlineUsers.set(userId, socket.id);

        // If volunteer, add to legacy map
        try {
            const user = await User.findById(userId).select("role");
            if (user?.role === "VOLUNTEER") {
                onlineVolunteers.set(userId, socket.id);
            }
            console.log("user registered",userId)
        } catch (err) {
            console.log("registerUser error:", err);
        }
    });

    // ---------------------------------------
    // 2) JOIN ROOM
    // (no permission check for now)
    // ---------------------------------------
    socket.on("joinChat", async ({ receiverId }) => {
        const senderId = String(socket.userId);
        receiverId = String(receiverId);

        const roomId = getRoomId(senderId, receiverId);
        socket.join(roomId);
        console.log(`User ${senderId} joined room ${roomId}`);
    });

    // ---------------------------------------
    // 3) SEND MESSAGE
    // (store in DB + emit to all in room)
    // ---------------------------------------
    socket.on("sendMessage", async ({ receiverId, message }) => {
        const senderId = socket.userId;
        if (!senderId || !receiverId || !message) return;

        const roomId = getRoomId(senderId, receiverId);

        try {
            const newMessage = await Message.create({
                sender: senderId,
                receiver: receiverId,
                message,
                roomId
            });

            // Send to both people in the room
            io.to(roomId).emit("receiveMessage", newMessage);

            // ALSO send directly to sender (in case of timing mismatch)
            io.to(socket.id).emit("receiveMessage", newMessage);

            // Notify receiver if they're online
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit("newMessageNotification", newMessage);
            }

        } catch (err) {
            console.log("sendMessage error:", err);
        }
    });

    // ---------------------------------------
    // 4) DISCONNECT CLEANUP
    // ---------------------------------------
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);

        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                onlineVolunteers.delete(userId);
                break;
            }
        }
    });
});

// Export io and onlineVolunteers for use in other modules
export { io, onlineUsers, onlineVolunteers, sendEmail };

const PORT = process.env.PORT || 4000

// Initialize Database connection, then start the server
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server successfully started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Critical Failure: Server failed to start due to MongoDB connection error.", err);
    });