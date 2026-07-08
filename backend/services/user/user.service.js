import { User } from "../../models/user.model.js";
import { FriendRequest } from "../../models/friendRequest.model.js";

export const getUser = async (identifier) => {
    try {
        const res = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        return res;
    } catch (err) {
        throw err;
    }
}


export const getContacts = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId }).populate("contacts", "username bio avatar lastSeen").lean();
        return user ? user.contacts : [];
    } catch (error) {
        throw error;
    }
}


// Internal helper — only called after a request is accepted
export const addContact = async (userId, friendId) => {
    try {
        const friend = await User.findById(friendId);

        if (!friend) {
            throw new Error("No user found");
        }

        if (userId.toString() === friendId.toString()) {
            throw new Error("You cannot add yourself.");
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { contacts: friendId }
        });

        await User.findByIdAndUpdate(friendId, {
            $addToSet: { contacts: userId }
        });

        return { message: "Contact added successfully." };
    } catch (error) {
        throw error;
    }
};


// ─── Friend Request Services ──────────────────────────────────────────────────

export const sendFriendRequest = async (senderId, receiverId) => {
    if (senderId.toString() === receiverId.toString()) {
        throw new Error("You cannot send a friend request to yourself.");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new Error("User not found.");
    }

    // Check if already contacts
    const sender = await User.findById(senderId);
    if (sender.contacts.map(String).includes(receiverId.toString())) {
        throw new Error("You are already friends with this user.");
    }

    // Check for an existing pending request in either direction
    const existing = await FriendRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
        ],
        status: "pending",
    });

    if (existing) {
        throw new Error("A friend request already exists between you two.");
    }

    const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });
    return request;
};


export const getFriendRequests = async (userId) => {
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
        .populate("sender", "username bio avatar")
        .sort({ createdAt: -1 })
        .lean();

    return requests;
};


export const respondToFriendRequest = async (requestId, userId, action) => {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
        throw new Error("Friend request not found.");
    }

    if (request.receiver.toString() !== userId.toString()) {
        throw new Error("You are not authorized to respond to this request.");
    }

    if (request.status !== "pending") {
        throw new Error("This request has already been responded to.");
    }

    if (action === "accept") {
        request.status = "accepted";
        await request.save();
        await addContact(request.receiver, request.sender);
    } else if (action === "reject") {
        request.status = "rejected";
        await request.save();
    } else {
        throw new Error("Invalid action. Use 'accept' or 'reject'.");
    }

    return request;
};
