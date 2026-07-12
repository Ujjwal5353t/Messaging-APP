import { Conversation } from "../../models/conversation.model.js"
import { Message } from "../../models/message.model.js";
import { addConvo } from "../user/conversation.service.js";

async function checkConversationExist(firstUserId , secondUserId) {
    const exist = await Conversation.findOne({
        participants : {
            $all : [firstUserId , secondUserId],
            $size : 2
        }
    })

    return exist;
}


export const postMessage = async ({senderId , receiverId , msg}) => {
    try {
        let convo = await checkConversationExist(senderId , receiverId);

        if (!convo) {
            convo = await addConvo({ senderId, recveiverId: receiverId });
        }

        const msgData = {
            conversation : convo._id,
            sender : senderId,
            content :  msg
        }

        const newMsg = await Message.create(msgData);

        
        convo.lastmsg = newMsg._id;
        convo.lastmsgAt = newMsg.createdAt;
        await convo.save();

        return newMsg;
    } catch (error) {
        console.log("Error in postmsg: " , error);
        throw error;
    }
}


export const getMessage = async({senderId , receiverId}) => {
    try {
        let convo = await checkConversationExist(senderId , receiverId);

        if(!convo){
            return []; 
        }

        const messages = await Message.find({
            conversation : convo._id
        }).sort({createdAt : 1}); 

        return messages;

    } catch (error) {
        console.log("Error in getMessage : " , error);
        throw error;
    }
}