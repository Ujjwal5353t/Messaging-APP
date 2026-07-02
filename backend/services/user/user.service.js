import { User } from "../../models/user.model.js";

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
        const user = await User.findById(userId).select("contacts").populate("contacts" , "username email bio");

        if(!user){
            throw new Error("No User found");
        }

        return user.contacts;

    } catch (error) {
        throw error;
    }
}


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