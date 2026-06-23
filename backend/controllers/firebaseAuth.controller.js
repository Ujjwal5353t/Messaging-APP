import { success } from "zod";
import { getUser } from "../services/auth.service.js";
import adminApp from "../utils/firebaseAdmin.js"


export const googleAuth = async (req , res) => {
    try {
        const {idToken} = req.body;

    const decodedToken = await adminApp.auth().verifyIdToken(idToken);
    const {email , uid} = decodedToken;

    try{
        const user = await getUser({email , provider : "google" , providerId : uid});
        return req.status(200).json({
            success : true,
            action : "login",
            ...user
        })
    } catch(error){
        if(error.message === "User does not exist"){
            return res.status(200).json({
                success : true,
                action : "require_encryption_keys",
                email : email,
                googleId : uid
            })
        }
        throw Error
    }
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : "Google verification failed"
        })
    }
}