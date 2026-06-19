import { User } from "../models/user.model"

export const addUser = async function ({username , email , password , publicKey}) {
    try{
        const existing = await User.findOne({
        $or : [{username} , {email} , {publicKey}]
        })
        if(existing){
            throw new Error ("user already exist")
        }
    } catch(err){
        
    }
}