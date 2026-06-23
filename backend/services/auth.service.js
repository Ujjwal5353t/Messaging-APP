import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generateToken = (userId) => {
    return jwt.sign(
        {userid :  userId},
        process.env.JWT_SECRET,
        {expiresIn : "1d"}
    )
}


export const addUser = async function ({username , email , password , publicKey , providers}) {
    try{
        const existing = await User.findOne({
        $or : [{username} , {email} , {publicKey}]
        })
        if(existing){
            throw new Error ("User with this username, email, or public key already exists")
        }

        const user = await User.create({
            username , 
            email,
            password,
            publicKey,
            providers
        })

        const token = generateToken(user._id);

        
        return {...user.toObject() , token}
    } catch(err){
        console.log(err);
        throw err;
    }
}


export const getUser = async ({email , password , provider , providerId}) => {
    try{
        const user = await User.findOne({email}).select("+password");;

        if(!user){
            throw new Error("Email not registered")
        }

        //social auth  
        if( provider && providerId ){
            const registeredID = user.providers?.[provider]?.id ;
            if(!registeredID || providerId !== registeredID){
                throw new Error(`No account Found linked with ${provider}`) ;
            }

            const token = generateToken(user._id);
            return {...user.toObject() , token}
        }

        if(!user.providers?.local?.enabled){
            throw new Error("No account found");
        }

       

        const isMatch = await user.comparePass(password);
        if( !isMatch ){
            throw new Error("Credentials Invalid") ;
        }
  

        const token = generateToken(user._id);
        return {...user.toObject() , token};
    }
    catch (err){
        throw new Error(err)
    }

}