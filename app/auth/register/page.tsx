// 
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-600 p-8">
        <img
          src="/logo_varient_2.png"
          alt="BODH Logo"
          width={400}
          height={400}
         
       
        />
        <p className="-mt-30 text-lg md:text-xl opacity-90 text-center max-w-sm text-white">
          Your digital bookshelf, just a login away.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
