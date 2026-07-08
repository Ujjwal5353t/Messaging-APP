import { success } from "zod";
import {  loginLocal, singupLocal } from "../../services/authentication/auth.service.js";

export const registerUserLocal = async function(req, res) {
    try{
        const user = await singupLocal(req.body);

        res.cookie("Token" , user.token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            success : true,
            action : "User_created",
            message : "User registered successfully",
            email : user.email,
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

        res.cookie("Token" , user.token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success : true,
            action : "login",
            message : "user logged in successfully",
        })
    } catch(err){
        return res.status(401).json({
            success : false ,
            message : err.message 
        })
    }
}


export const handleLogout = async (req , res) => {
    res.clearCookie("Token" , {
        httpOnly : true , 
        secure : process.env.NODE_ENV,
        sameSite :  "strict"
    })

    res.status(200).json({
        success : true ,
        message : "User logged out successfully"
    })
}

