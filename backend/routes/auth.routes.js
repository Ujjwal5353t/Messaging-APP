import { Router } from "express";
import { validate, validateToken } from "../middlewares/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "../validators/userAuth.validator.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { googleAuth } from "../controllers/firebaseAuth.controller.js";


const router = Router();

router.post(
    "/register",
    validate(registerUserSchema),
    registerUser
)

router.post(
    "/login",
    validate(loginUserSchema),
    loginUser
)

router.post(
    "/google",
    googleAuth
)

export default router