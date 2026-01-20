"use client";

import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Branding Section */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-600 p-12">
        <img
          src="/logo_varient_2.png"
          alt="BODH Logo"
          width={300}
          height={300}
          className="mb-6"
        />
        <p className="text-lg md:text-xl opacity-90 text-center max-w-sm text-white">
          Your digital bookshelf, just a login away.
        </p>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-12 shadow-lg">
        <RegisterForm />
      </div>
    </div>
  );
}




// "use client";
// import { useForm } from "react-hook-form";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { handleRegister } from "../../../lib/actions/auth-action";



// export const registerSchema = z.object(
//     {
//         email: z.email({ message: "Email milena" }),
//         username: z.string().min(3, { message: "Username pugena" }),
//         firstName: z.string().min(1, { message: "First Name pugena" }),
//         lastName: z.string().min(1, { message: "Last Name pugena" }),
//         confirmPassword: z.string().min(6, { message: "Confirm Password pugena" }),
//         password: z.string().min(6, { message: "Password pugena" })
//     }
// ).refine((data) => data.password === data.confirmPassword,
//     {
//         message: "Passwords do not match",
//     }
// );

// export type RegisterForm = z.infer<typeof registerSchema>;

// export default function Page() {
//     const router = useRouter();
//     const [pending, setTransition] = useTransition()
//     const { register, handleSubmit, formState: { errors, isSubmitting } }
//         = useForm<RegisterForm>(
//             {
//                 resolver: zodResolver(registerSchema),
//             }
//         )
    
//     const [error, setError] = useState("");
//     const onSubmit = async (data: RegisterForm) => {
//         // call action here
//         setError("");
//         try{
//             const res = await handleRegister(data);
//             if(!res.success){
//                 throw new Error(res.message || "Registration failed");
//             }
//             // handle redirect (optional)
//             setTransition(() => {
//                 router.push("/login");
//             });
//         }catch(err:Error | any){
//             setError(err.message || "Registration failed");
//         }
//     }
    
//     return (
//         <div>
//             { error && <div className="text-red-500">{error}</div> }
//             <form onSubmit={handleSubmit(onSubmit)}
//                 className="mx-auto p-2 max-w-xl border">
//                 <div className="mt-2">
//                     <label>Email</label>
//                     <input {...register("email")}  className="border"/>
//                     {errors.email && <span className="text-red-500">{errors.email.message}</span>}
//                 </div>
        
//                 <div className="mt-2">
//                     <label>Username</label>
//                     <input {...register("username")} className="border" />
//                     {errors.username && <span className="text-red-500">{errors.username.message}</span>}
//                 </div>

//                 <div className="mt-2">
//                     <label>First Name</label>
//                     <input {...register("firstName")} className="border" />
//                     {errors.firstName && <span className="text-red-500">{errors.firstName.message}</span>}
//                 </div>

//                 <div className="mt-2">
//                     <label>Last Name</label>
//                     <input {...register("lastName")} className="border" />
//                     {errors.lastName && <span className="text-red-500">{errors.lastName.message}</span>}
//                 </div>

//                 <div className="mt-2">
//                     <label>Password</label>
//                     <input type="password" {...register("password")} className="border" />
//                     {errors.password && <span className="text-red-500">{errors.password.message}</span>}
//                 </div>

//                 <div className="mt-2">
//                     <label>Confirm Password</label>
//                     <input type="password" {...register("confirmPassword")} className="border" />
//                     {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
//                 </div>

//                 <button type="submit" className="p-2 bg-green-500 mt-4">Submit</button>
//             </form>
//         </div>
//     );
// }








// "use client";

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { handleRegister } from "../../../lib/actions/auth-action";

// /* ---------------- SCHEMA ---------------- */
// export const registerSchema = z
//   .object({
//     email: z.string().email("Email milena"),
//     username: z.string().min(3, "Username pugena"),
//     firstName: z.string().min(1, "First Name pugena"),
//     lastName: z.string().min(1, "Last Name pugena"),
//     password: z.string().min(6, "Password pugena"),
//     confirmPassword: z.string().min(6, "Confirm Password pugena"),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// export type RegisterFormData = z.infer<typeof registerSchema>;

// /* ---------------- COMPONENT ---------------- */
// export default function RegisterForm() {
//   const router = useRouter();
//   const [error, setError] = useState("");
//   const [pending, startTransition] = useTransition();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//   });

//   const onSubmit = async (data: RegisterFormData) => {
//     setError("");
//     try {
//       const res = await handleRegister(data);

//       if (!res.success) {
//         throw new Error(res.message || "Registration failed");
//       }

//       startTransition(() => {
//         router.push("/login");
//       });
//     } catch (err: any) {
//       setError(err.message || "Registration failed");
//     }
//   };

//   return (
//     <div className="w-full max-w-md">
//       <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         {/* Email */}
//         <div>
//           <input
//             {...register("email")}
//             placeholder="Email"
//             className="w-full border p-2 rounded"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm">{errors.email.message}</p>
//           )}
//         </div>

//         {/* Username */}
//         <div>
//           <input
//             {...register("username")}
//             placeholder="Username"
//             className="w-full border p-2 rounded"
//           />
//           {errors.username && (
//             <p className="text-red-500 text-sm">{errors.username.message}</p>
//           )}
//         </div>

//         {/* First Name */}
//         <div>
//           <input
//             {...register("firstName")}
//             placeholder="First Name"
//             className="w-full border p-2 rounded"
//           />
//           {errors.firstName && (
//             <p className="text-red-500 text-sm">{errors.firstName.message}</p>
//           )}
//         </div>

//         {/* Last Name */}
//         <div>
//           <input
//             {...register("lastName")}
//             placeholder="Last Name"
//             className="w-full border p-2 rounded"
//           />
//           {errors.lastName && (
//             <p className="text-red-500 text-sm">{errors.lastName.message}</p>
//           )}
//         </div>

//         {/* Password */}
//         <div>
//           <input
//             type="password"
//             {...register("password")}
//             placeholder="Password"
//             className="w-full border p-2 rounded"
//           />
//           {errors.password && (
//             <p className="text-red-500 text-sm">{errors.password.message}</p>
//           )}
//         </div>

//         {/* Confirm Password */}
//         <div>
//           <input
//             type="password"
//             {...register("confirmPassword")}
//             placeholder="Confirm Password"
//             className="w-full border p-2 rounded"
//           />
//           {errors.confirmPassword && (
//             <p className="text-red-500 text-sm">
//               {errors.confirmPassword.message}
//             </p>
//           )}
//         </div>

//         <button
//           type="submit"
//           disabled={isSubmitting || pending}
//           className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
//         >
//           {isSubmitting || pending ? "Registering..." : "Register"}
//         </button>
//       </form>
//     </div>
//   );
// }
