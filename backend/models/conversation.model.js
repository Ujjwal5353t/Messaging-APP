import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
    participants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }] , 
    lastmsg : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Message"
    },
    lastmsgAt : Date,
    unreadCount : {
        type : Map,
        of : Number
    }
} , {timestamps : true })

export const Conversation =  mongoose.model("Conversation" , conversationSchema);