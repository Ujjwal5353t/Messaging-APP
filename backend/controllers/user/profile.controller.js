import { getProfile, updateProfile } from "../../services/user/profile.service.js";

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await getProfile(userId);

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await updateProfile(userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};