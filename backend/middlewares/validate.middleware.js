import { success, parse, ZodError } from "zod";
import jwt from "jsonwebtoken"

export const validate = (Schema) => (req, res, next) => {
    try {
        Schema.parse({
            body: req.body
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                // ◄ Fixed: Changed error.errors to error.issues
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
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            message: "No token provided"
        })
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = await jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.user = decoded

        return next();
    } catch (error) {
        res.status(401).json({
            message: "authorization failed"
        })
    }
}