// import { z } from "zod";

// // Base User schema
// export const UserSchema = z.object({
//   fullName: z.string().min(2, "Full name is required"),
//   email: z.string().email("Invalid email"),
//   username: z.string().min(3, "Username must be at least 3 characters"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   role: z.enum(["user", "admin"]).default("user"),
// });

// export type UserType = z.infer<typeof UserSchema>;


import { z } from "zod";

export const UserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).default("user"),

  // ✅ optional in type
  avatarUrl: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
