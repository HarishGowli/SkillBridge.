import Message from "../models/Message.js";
import { getRoomId } from "../utils/getRoomId.js";

export const getChatHistory = async (req, res) => {
    try {
        const senderId = req.user.id;               // logged in user (NGO or volunteer)
        const receiverId = req.params.otherUserId;  // the other user
        // Generate stable roomId
        const roomId = getRoomId(senderId, receiverId);
        // Get messages sorted in correct order
        const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
        return res.json(messages);
    } catch (err) {
        console.error("Chat history error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
