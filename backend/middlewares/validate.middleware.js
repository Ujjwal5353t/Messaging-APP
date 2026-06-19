import { success , parse } from "zod";

export const validate  = (Schema) => (req , res , next) => {
    try{
        Schema.parse({
            body : req.body
        });
        next();
    } catch (error) {
        return res.status(400).json({
            success : false,
            errors : error.errors.map((err) => ({
                field : err.path[1],
                message : err.message
            }))
        })
    }
}