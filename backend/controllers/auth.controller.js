import { success } from "zod";
import {  loginLocal, singupLocal } from "../services/auth.service.js";

export const registerUserLocal = async function(req, res) {
    try{
        const user = await singupLocal(req.body);

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


export const loginUserLocal = async (req , res) => {
    try{
        const user = await loginLocal(req.body);

        return res.status(200).json({
            success : true,
            action : "login",
            message : "user logged in successfully",
            token : user.token
        })
    } catch(err){
        return res.status(401).json({
            success : false ,
            message : err.message 
        })
    }
}

