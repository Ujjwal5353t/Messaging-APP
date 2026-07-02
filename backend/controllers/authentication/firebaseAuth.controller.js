import { getUserByProvider, loginOauth, signupOauth } from "../../services/authentication/auth.service.js";
import {adminAuth} from "../../utils/firebaseAdmin.js"


export const OauthLogin = async (req, res) => {
    try {
        console.log("controller reached");
        const { idToken , provider } = req.body;

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { email, uid } = decodedToken;

        console.log(uid)

        const existing = await getUserByProvider({ provider: provider, providerId : uid });
        console.log(existing);
        if (!existing) {
            return res.status(200).json({
                success: true,
                action: "require_encryption_keys",
                email: email,
            })
        }

        const user = await loginOauth(existing);

        return res.status(200).json({
            success: true,
            action: "login",
            ...user
        })
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

export const Oauthsignup = async (req, res) => {
    try {
        const { idToken, publicKey , provider } = req.body;
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const { email, uid } = decodedToken;
        try {
            const user = await signupOauth({ email : email || null , provider: provider, providerId: uid, publicKey });
            return res.status(201).json({
                success: true,
                message: "User signUp successfull",
                ...user
            })
        } catch (err) {
            return res.status(409).json({
                success: false,
                message: err.message
            });
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Authenication Failed , try again later",
            code : error.message
        })
    }
}