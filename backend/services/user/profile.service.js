import { User } from "../../models/user.model.js";

export const getProfile = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw error;
    }
};

export const updateProfile = async (userId, updateData) => {
    try {
        const allowedFields = ['username', 'bio', 'avatar'];
        const updates = {};
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            throw new Error("No valid fields to update");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    } catch (error) {
        throw error;
    }
};