import { Conversation } from "../../models/conversation.model.js"

export const addConvo = async ({recveiverId , senderId}) => {
    try {
        const convo = await Conversation.create({
        participants : [senderId , recveiverId],
        lastmsg : null,
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