import { Router } from "express";
import { validate, validateToken } from "../../middlewares/validate.middleware.js";
import { createConversationSchema } from "../../validators/conversation.validator.js";
import { createConvo } from "../../controllers/user/conversation.controller.js";

const router = Router();

router.post(
    "/create",
    validate(createConversationSchema),
    validateToken,
    createConvo
)


export default router;