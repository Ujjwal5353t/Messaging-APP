import * as z from "zod"

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createConversationSchema = z.object({
    body : z.object({
        participants : z.array( z.string().regex(objectIdRegex , "Invalid user ID format"))
        .min(2 , "A conversation must have 2 participants")
    })
})