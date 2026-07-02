import { success } from "zod";
import { addContact, getContacts, getUser } from "../../services/user/user.service.js";

export const findUser = async (req , res) => {
    try {
        const {identifier} = req.query;
        const user = await getUser(identifier);
        if(!user){
            return res.status(404).json({
                success : false,
                message : "No User found",
            })
        }

        return res.status(200).json({
                success : true,
                message : "User found",
                data : user
            })
    } catch (error) {
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }

}


export const contactList = async (req , res) => {
    try{
        const contacts = await getContacts(req.user._id);

        if(contacts.length === 0){
            return res.status(200).json({
                success : true, 
                message : "No contacts for the user",
                contacts : []
            })
        }
        return res.status(200).json({
            success : true,
            contacts
        })
    } catch(err){
        return res.status(400).json({
            success : false ,
            message  : err.message
        })
    }
} 


export const createContact = async (req , res) => {
    try {
        const {friendId} = req.body;

    await addContact(req.user._id , friend._id);

    return res.status(200).json({
            success: true,
            message: "Contact added successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success : false ,
            message : error.message
        })
    }
}