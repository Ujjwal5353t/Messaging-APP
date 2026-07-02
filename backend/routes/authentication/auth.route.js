import { Router } from "express";
import { validate, validateToken } from "../../middlewares/validate.middleware.js";
import { loginUserSchema, registerUserSchema, socialAuthSchema } from "../../validators/userAuth.validator.js";
import { loginUserLocal, registerUserLocal } from "../../controllers/authentication/auth.controller.js";
import { OauthLogin , Oauthsignup } from "../../controllers/authentication/firebaseAuth.controller.js";


const router = Router();

router.post(
    "/register",
    validate(registerUserSchema),
    registerUserLocal
)

router.post(
    "/login",
    validate(loginUserSchema),
    loginUserLocal
)

router.post(
    "/Oauth-login",
    validate(socialAuthSchema),
    OauthLogin
)

router.post(
    "/Oauth-signup",
    validate(socialAuthSchema),
    Oauthsignup
)

export default router