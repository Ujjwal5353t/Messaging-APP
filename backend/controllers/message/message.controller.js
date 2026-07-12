import { getMessage, postMessage } from "../../services/message/message.service.js"

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, msg } = req.body;
        const senderId = req.user._id || req.body.senderId;

        if (!receiverId || !msg) {
            return res.status(400).json({
                success: false,
                message: "Missing receiverId or msg in request body"
            });
        }

        const response = await postMessage({ senderId, receiverId, msg });
        if (!response) {
            return res.status(400).json({
                success: false,
                message: "Cant send message"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Message sent successfully to server",
            response
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


export const fetchMessage = async (req, res) => {
    try {
        const { receiverId } = req.query;
        const senderId = req.user._id || req.query.senderId;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Missing receiverId in query parameters"
            });
        }

        const response = await getMessage({ senderId, receiverId });

        if (!response) {
            return res.status(400).json({
                success: false,
                message: "No chats for users found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "chats fetched",
            response
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}