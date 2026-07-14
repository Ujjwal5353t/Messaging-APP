import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import {createServer} from "http"
import { Server } from "socket.io";
import { Message } from "./models/message.model.js";
import { Conversation } from "./models/conversation.model.js";

const app = express();
const server = createServer(app);

const allowedOrigins = ["http://localhost:3000", "null", null];

app.use(cors({
    origin : (origin, callback) => {
        // Allow requests with no origin (e.g. Electron, curl) or from allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials : true
}));
app.use(express.json());
app.use(cookieParser());


import authRouter from "./routes/authentication/auth.route.js"
import userRouter from "./routes/users/user.route.js"
import conversationRouter from "./routes/users/conversation.route.js"
import messageRouter from "./routes/message/message.route.js"


app.use("/auth" , authRouter);
app.use("/users" , userRouter);
app.use("/conversation" , conversationRouter);
app.use("/message" , messageRouter)


const io = new Server(server , {
    cors : {
        origin: (origin, callback) => {
            // Allow Electron (null origin) and localhost
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
            }
        },
        credentials: true
    }
});


const onlineUsers = new Map();

io.on("connection" , (socket) => {
    const userId = socket.handshake.query.id;

    if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`User connected: ${userId} (socket: ${socket.id})`);
    }

    
    socket.on("send_message", async (data) => {
        try {
            const { senderId, receiverId, msg, conversationId } = data;

            if (!senderId || !receiverId || !msg) return;

            
            let convo;
            if (conversationId) {
                convo = await Conversation.findById(conversationId);
            }

            if (!convo) {
                
                convo = await Conversation.findOne({
                    participants: { $all: [senderId, receiverId] }
                });

                if (!convo) {
                    convo = await Conversation.create({
                        participants: [senderId, receiverId]
                    });
                }
            }

            const newMessage = await Message.create({
                conversation: convo._id,
                sender: senderId,
                content: msg,
                status: "Sent"
            });

            
            convo.lastmsg = newMessage._id;
            convo.lastmsgAt = newMessage.createdAt;

            // Increment unread count for the receiver
            const currentUnread = convo.unreadCount?.get(receiverId) || 0;
            if (!convo.unreadCount) convo.unreadCount = new Map();
            convo.unreadCount.set(receiverId, currentUnread + 1);

            await convo.save();

            const payload = {
                _id: newMessage._id,
                sender: senderId,
                receiver: receiverId,
                content: msg,
                conversationId: convo._id,
                status: newMessage.status,
                createdAt: newMessage.createdAt
            };

            
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive_message", payload);

                
                newMessage.status = "Delivered";
                await newMessage.save();
                payload.status = "Delivered";
            }

            
            socket.emit("message_sent", payload);

        } catch (err) {
            console.error("send_message error:", err);
            socket.emit("message_error", { error: "Failed to send message" });
        }
    });

    
    socket.on("typing_start", ({ senderId, receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("user_typing", { senderId, typing: true });
        }
    });

    socket.on("typing_stop", ({ senderId, receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("user_typing", { senderId, typing: false });
        }
    });

    
    socket.on("message_seen", async ({ messageId, senderId }) => {
        try {
            const message = await Message.findByIdAndUpdate(messageId, { status: "Seen" }, { new: true });

            // Reset unread count for this user in the conversation
            if (message && message.conversation) {
                await Conversation.findByIdAndUpdate(message.conversation, {
                    [`unreadCount.${userId}`]: 0
                });
            }

            const senderSocketId = onlineUsers.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("message_status_update", {
                    messageId,
                    status: "Seen"
                });
            }
        } catch (err) {
            console.error("message_seen error:", err);
        }
    });

   
    socket.on("disconnect", () => {
        if (userId) {
            onlineUsers.delete(userId);
            io.emit("online_users", Array.from(onlineUsers.keys()));
            console.log(`User disconnected: ${userId}`);
        }
    });
});


export { io };

app.get("/" , (req , res) => {
    res.send("Hello world")
} )

export { server };
export default app;