import Router from "express" ;
import { validateToken } from "../../middlewares/validate.middleware.js";
import { fetchMessage, sendMessage } from "../../controllers/message/message.controller.js";

const router = Router();

router.post(
    "/sendMessage",
    validateToken,
    sendMessage
)

router.get(
    "/getMessage",
    validateToken,
    fetchMessage
)

export default router ; 