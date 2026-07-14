import { success } from "zod";
import { addContact, getContacts, getUser, pubKey } from "../../services/user/user.service.js";

export const findUser = async (req, res) => {
    try {
        const { identifier } = req.query;
        const user = await getUser(identifier);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No User found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "User found",
            data: user
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }

}


export const contactList = async (req, res) => {
    try {
        console.log("controller reached");
        const contacts = await getContacts(req.user._id);
        console.log("service layer response : " , contacts);
        if (contacts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No contacts for the user",
                contacts: []
            })
        }
        return res.status(200).json({
            success: true,
            contacts
        })
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }
}


export const createContact = async (req, res) => {
    try {
        const { friendId } = req.body;
        console.log("calling service layer");
        await addContact(req.user._id, friendId);
        console.log("after service layer");
        return res.status(200).json({
            success: true,
            message: "Contact added successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const getPublicKey = async (req , res) => {
    try {
        const {receiverId} = req.query;

        const key = await pubKey(receiverId);

        if(!key){
            return res.status(404).json({
                success : false ,
                message: "No public key found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Public key found",
            key
        });
        
    } catch (error) {
        return res.status(400).json({
            success : false ,
            message : error.message
        })
    }
}