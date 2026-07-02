import * as z from "zod"

export const findUserQuerySchema = z.object({
    query : z.object({
        identifier : z.string().min(1 , "Identifier is required")
    })
})