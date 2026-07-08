import { Router } from "express";
import { contactList, createContact, findUser } from "../../controllers/user/user.controller.js";
import { getUserProfile, updateUserProfile } from "../../controllers/user/profile.controller.js";
import { sendRequest, getRequests, respondRequest } from "../../controllers/user/friendRequest.controller.js";
import { validate, validateToken } from "../../middlewares/validate.middleware.js";
import { findUserQuerySchema } from "../../validators/userParams.validator.js";
import { updateProfileSchema } from "../../validators/profile.validator.js";

const router = Router();

router.get(
    "/find",
    validate(findUserQuerySchema),
    validateToken,
    findUser
);

router.get(
    "/profile",
    validateToken,
    getUserProfile
);

router.patch(
    "/profile",
    validate(updateProfileSchema),
    validateToken,
    updateUserProfile
);

router.get(
    "/contacts",
    validateToken,
    contactList
)

router.post(
    "/add",
    validateToken,
    createContact
)

// ─── Friend Request Routes ────────────────────────────────────────────────────
router.post("/friend-request/send", validateToken, sendRequest);
router.get("/friend-request", validateToken, getRequests);
router.patch("/friend-request/:requestId", validateToken, respondRequest);

export default router;