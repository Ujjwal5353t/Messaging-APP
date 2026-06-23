import { success } from "zod";
import { addUser, getUser } from "../services/auth.service.js";

export const registerUser = async function(req, res) {
    try{
        const user = await addUser(req.body);

        return res.status(201).json({
            success : true,
            action : "User_created",
            message : "User registered successfully",
            email : user.email,
            token : user.token
        })
       
    } catch (error){
        return res.status(401).json({
            message : error.message
        })
    }
}


export const loginUser = async (req , res) => {
    try{
        const user = await getUser(req.body);

        return res.status(200).json({
            success : true,
            action : "login",
            message : "user logged in successfully"
        })
    } catch(err){
        return res.status(401).json({
            success : false ,
            message : err.message 
        })
    }
}

