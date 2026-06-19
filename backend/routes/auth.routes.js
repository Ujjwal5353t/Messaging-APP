import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema } from "../validators/userAuth.validator.js";
import { registeruser } from "../controllers/auth.controller.js";


const router = Router();

router.post(
    "\register",
    validate(registerUserSchema),
    registeruser
)