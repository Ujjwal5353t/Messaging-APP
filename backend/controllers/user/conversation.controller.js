
import { addConvo } from "../../services/user/conversation.service.js";

export const createConvo = async (req , res) => {
    try {
        const create = await addConvo(req.body);

    if(!create){
        return res.json(400).json({
            success : false  ,
            message : "Can't create a Conversation"
        })
    }

    return res.json(201).json({
        success : true ,
        message : "Conversation created successfully",
        create
    })
    } catch (error) {
        return res.json({
            success : false ,
            message : error.message
        })
    }
}