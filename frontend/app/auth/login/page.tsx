import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Main Card Container */}
      <main className="flex w-full max-w-5xl h-[70vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Left Branding Section */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 text-white p-12">
          <img
            src="/LOGO.png"
            alt="BODH Logo"
            width={300}
            height={300}
            className="mb-6 filter brightness-0 invert"
          />
          <h1 className="text-3xl font-bold mb-4">Hello, welcome!</h1>
          <p className="text-lg max-w-sm text-center opacity-90 mb-6">
            Discover your next favorite book, build your digital shelf, and keep every story just a login away.
          </p>
        </div>

        {/* Right Form Section */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-12">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}



// "use client";
// import { useForm } from "react-hook-form";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";

// export const loginSchema = z.object(
//     {
//         email: z.email({ message: "Email milena" }),
//         password: z.string().min(6, { message: "Password pugena" })
//     }
// )
// export type LoginForm = z.infer<typeof loginSchema>;

// export default function Page() {
//     const router = useRouter();
//     const [pending, setTransition] = useTransition()
//     const { register, handleSubmit, formState: { errors, isSubmitting } }
//         = useForm<LoginForm>(
//             {
//                 resolver: zodResolver(loginSchema),
//             }
//         )
    
//     const [error, setError] = useState("");
//     const onSubmit = async (data: LoginForm) => {
//         // call action here
        
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
        
                

