import { success, parse, ZodError } from "zod";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const validate = (Schema) => (req, res, next) => {
    try {
        Schema.parse({
            body: req.body,
            query : req.query,
            params : req.params
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err) => {
                    const fieldName = err.path[0] === "body" ? err.path[1] : err.path[0];

                    return {
                        field: fieldName || "form",
                        message: err.message,
                    };
                }),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}

export const validateToken = async (req, res, next) => {
    const token = req.cookies?.Token;

    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        })
    }

    try {
        const decoded = await jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.user = {
            ...decoded,
            _id: decoded._id || decoded.userId || decoded.userid,
            userid: decoded.userid || decoded.userId || decoded._id,
            userId: decoded.userId || decoded._id || decoded.userid,
        }

        // Update user's lastSeen timestamp in the background
        User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() }).catch((err) => {
            console.error("Failed to update lastSeen:", err);
        });

        return next();
    } catch (error) {
        res.status(401).json({
            message: "authorization failed"
        })
    }
}