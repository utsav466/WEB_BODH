import z from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Minimum 2 characters" }),
  username: z.string().min(3, { message: "Minimum 3 characters" }),
  email: z.string().email({ message: "Enter a valid email" }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: "Phone must be 10 digits" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Minimum 6 characters" }),
}).refine((v) => v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type RegisterData = z.infer<typeof registerSchema>;
