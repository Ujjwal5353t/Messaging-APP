import * as z from "zod"

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const registerUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username can't be greater than 30 characters")
      .trim(),
    email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, "Password length must be at least 6 characters long")
      .optional(),

    publicKey: z
      .string()
      .min(10, "A valid cryptographic public key is required"),
      
    avatar: z
      .string()
      .url("Avatar must be a valid URL string")
      .optional(),
    bio : z
      .string()
      .optional(),
    contacts: z
      .array(z.string().regex(objectIdRegex, "Invalid contact user ID"))
      .optional()
  }).refine((data) => {
    // Custom validation: If local provider is enabled, a password MUST be provided
    if (data.providers?.local?.enabled && !data.password) {
      return false;
    }
    return true;
  }, {
    message: "Password is required when registering a local account",
    path: ["password"] 
  })
});

export const socialLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    provider: z.enum(["google", "X"]),
    providerId: z.string().min(1, "Provider ID is required")
  })
});


export const loginUserSchema = z.object({
    body : z.object({
        identifier : z.string().email("Invalid email or Username").toLowerCase().trim(),
        password : z.string().min(6,"Password must be atleast 6 character long")
    })
});


export const socialAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
  }),
});