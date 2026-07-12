import { Conversation } from "../../models/conversation.model.js"

export const addConvo = async ({recveiverId , senderId , msg}) => {
    try {
        const convo = await Conversation.create({
        participants : [senderId , recveiverId],
        lastmsg : msg,
        lastmsgAt : null ,
        unreadCount : {
            [senderId] : 0,
            [recveiverId] : 0
        }
        })

        return convo;
    } catch (error) {
        throw error.message;
    }
}