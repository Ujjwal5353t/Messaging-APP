import * as z from "zod"

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const registerUserSchema = z.object({
    body : z.object({
        username : z
            .string()
            .min(4  , "username must be atleast 4 character long")
            .max(30 , "Username can't be greater than 30 characters")
            .trim(),
        email : z
            .string()
            .email("invalid email format")
            .toLowerCase()
            .trim() ,
        password : z
            .string()
            .min(6 , "Password lenght must be atleast 6 characters long") ,
        publicKey : z
            .string()
            .min(10 , "valid public key is required") ,
        avatar : z
            .string()
            .url("Avatar must be a valid URL string") 
            .optional() ,
        contacts : z
            .array(z.string().regex(objectIdRegex , "Invalid contact user ID"))
            .optional()
    })
});


export const loginUserSchema = z.object({
    body : z.object({
        email : z.string().email("Invalid email format").toLowerCase().trim(),
        password : z.string().min(1,"Password is required")
    })
});