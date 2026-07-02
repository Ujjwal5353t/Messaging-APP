import * as z from "zod";

export const updateProfileSchema = z.object({
    body: z.object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters long")
            .max(30, "Username can't be greater than 30 characters")
            .trim()
            .optional(),
        bio: z
            .string()
            .max(500, "Bio can't be longer than 500 characters")
            .optional(),
        avatar: z
            .string()
            .url("Avatar must be a valid URL")
            .optional(),
    }).refine((data) => {
        return Object.keys(data).length > 0;
    }, {
        message: "At least one field must be provided",
    }),
});