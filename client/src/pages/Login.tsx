import { SignIn } from "@clerk/clerk-react";
import { Star } from "lucide-react";
import { assets } from "@/assets/assets";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Background */}
      <img
        src={assets.bgImage}
        alt="background"
        className="absolute top-0 left-0 -z-100 w-full h-full object-cover"
      />

      {/* Left Panel */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">
        <img src={assets.logo} alt="logo" className="h-20 object-contain" />

        <div>
          <div className="flex items-center gap-3 mb-4 max-md:mt-10">
            <img src={assets.group_users} alt="users" />

            <div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 md:size-4.5 text-transparent fill-amber-500" />
                ))}
              </div>
              <p>Used by 12k+ developers</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-6xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
            More than just friends, truly connect
          </h1>

          <p className="text-2xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">
            Connect with global community on BuzzConnect
          </p>
        </div>

        <span className="md:h-10"></span>
      </div>

      {/* Right Panel / Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <SignIn />
      </div>
    </div>
  );
}
