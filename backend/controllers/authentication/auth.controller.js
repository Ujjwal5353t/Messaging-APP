import { success } from "zod";
import {  loginLocal, singupLocal } from "../../services/authentication/auth.service.js";
import { getCookieOptions, getClearCookieOptions } from "../../utils/cookie.js";

export const registerUserLocal = async function(req, res) {
    try{
        const user = await singupLocal(req.body);

        res.cookie("Token" , user.token , getCookieOptions(req))

        return res.status(201).json({
            success : true,
            action : "User_created",
            message : "User registered successfully",
            email : user.email,
            userId : user._id,
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

        res.cookie("Token" , user.token , getCookieOptions(req))

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
    res.clearCookie("Token" , getClearCookieOptions(req))

    res.status(200).json({
        success : true ,
        message : "User logged out successfully"
    })
}

