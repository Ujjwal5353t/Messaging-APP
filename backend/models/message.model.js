import mongoose, { mongo } from "mongoose";

const messageSchema = mongoose.Schema({
    conversation : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Conversation"
    },
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    } ,  
    content : {
        type : String,
        required : true
    } ,
    nonce : {
        type : String ,
    },
    status : {
        type : String,
        enum : ["Sent" , "Delivered" , "Seen"],
        default : "Sent"
    }
}, {timestamps : true})

export const Message = mongoose.model("Message" ,  messageSchema);