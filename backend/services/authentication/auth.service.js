import { User } from "../../models/user.model.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const generateToken = (userId) => {
    return jwt.sign(
        {
            _id: userId,
            userid: userId,
            userId: userId,
        },
        process.env.JWT_SECRET,
        {expiresIn : "1d"}
    )
};

const generateAuthResponse = (user) => {
    const token = generateToken(user._id);

    return { ...user.toObject() , token };
};

export const singupLocal = async function ({ username , email , password , publicKey , providers , bio  }) {
    try{
        const existing = await User.findOne({
        $or : [ {username} , {email} , {publicKey}]
        })
        if(existing){
            throw new Error ("User with this username, email, or public key already exists")
        }
        
        const lastSeen = new Date();

        const user = await User.create({
            username , 
            email,
            password,
            publicKey,
            providers :[{
                provider : "local",
                providerId : email
            }],
            bio,
            lastSeen
        })

        return generateAuthResponse(user);
    } catch(err){
        throw err;
    }
}


export const loginLocal = async ({identifier , password }) => {
    try{
        const user = await User.findOne({
            $or : [
                {email : identifier},
                {username : identifier}
            ]
        }).select("+password");;

        if(!user){
            throw new Error("Invalid Credentials")
        }
        const isMatch = await user.comparePass(password);
        if( !isMatch ){
            throw new Error("Credentials Invalid") ;
        }

        user.lastSeen = new Date();

        await user.save();

        return generateAuthResponse(user);
    }
    catch (err){
        throw err
    }
}

export const getUserByProvider = async ({provider , providerId}) => {
    try {
        const existing = await User.findOne({
            providers : {
                $elemMatch : {
                    provider,
                    providerId
                }
            }
        });

        if(existing){
            return existing;
        }
    } catch (error) {
        throw error;
    }
}


export const signupOauth = async ({ email , publicKey , provider , providerId}) => {
    console.log("DEBUG SIGNUP PAYLOAD:", { email, provider, providerId });
    try {

        const queryConditions = [{publicKey}];

        if(email){
            queryConditions.push({email});
        }

        const existing = await User.findOne({
            $or : queryConditions
        })

        if(existing){
            throw new Error("User already exists");
        }    

       let baseUsername = "user";
        if (email && typeof email === "string") {
            baseUsername = email.split("@")[0];
        } else if (providerId) {
            baseUsername = `tw_${providerId.substring(0, 6)}`;
        }
        const randomSuffix = crypto.randomBytes(3).toString("hex");

        const username = `${baseUsername}_${randomSuffix}`;

        const lastSeen = new Date();


        const user = await User.create({
            username,
            email : email || null ,
            publicKey,
            providers : [{
                provider : provider,
                providerId : providerId
            }],
            lastSeen
        })

        return generateAuthResponse(user);
    } catch (error) {
        throw error;
    }
}


export const loginOauth  = async (user) => {
    user.lastSeen = new Date();
    await user.save();
    return generateAuthResponse(user);
}