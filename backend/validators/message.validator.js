import * as z from "zod"


const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const sendMessageSchema = z.object({
    body : z.object({
        conversation : z
            .string()
            .regex(objectIdRegex , "Invalid Conversation ID format"),
        sender : z
            .string()
            .regex(objectIdRegex , "Invalid sender ID format"),
        content : z
            .string()
            .min(1 , "encrypted messages cannot be empty"),
        nonce : z
            .string()
            .min(1 , "Cryptographic nonce is required"),
        status : z
            .enum(["Sent" , "Delivered" , "Seen"])
            .default("Sent")
            .optional()        
    })
});