import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters long"),
      
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
      
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
      
    image: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: z
      .string()
      .min(1, "Password is required"),
  }),
});

export const AuthValidation = {
  registerSchema,
  loginSchema,
};