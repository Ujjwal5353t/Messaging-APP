import {
    sendFriendRequest,
    getFriendRequests,
    respondToFriendRequest,
} from "../../services/user/user.service.js";


export const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        if (!receiverId) {
            return res.status(400).json({ success: false, message: "receiverId is required." });
        }

        const request = await sendFriendRequest(req.user._id, receiverId);
        return res.status(201).json({ success: true, message: "Friend request sent.", data: request });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


export const getRequests = async (req, res) => {
    try {
        const requests = await getFriendRequests(req.user._id);
        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


export const respondRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body; // "accept" | "reject"

        if (!action) {
            return res.status(400).json({ success: false, message: "action is required ('accept' or 'reject')." });
        }

        const updated = await respondToFriendRequest(requestId, req.user._id, action);
        return res.status(200).json({ success: true, message: `Request ${action}ed.`, data: updated });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
