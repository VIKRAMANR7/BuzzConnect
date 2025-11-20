import { UserButton, useClerk } from "@clerk/clerk-react";
import { CirclePlus, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { assets } from "@/assets/assets";
import MenuItems from "@/components/MenuItems";
import type { RootState } from "@/types/store";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const user = useSelector((state: RootState) => state.user.value);

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between
      max-sm:absolute top-0 bottom-0 z-20 ${
        sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300`}
    >
      <div className="w-full">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="Logo"
          className="w-60 ml-4 my-2 cursor-pointer"
        />

        <hr className="border-gray-300 mb-8" />

        <MenuItems setSidebarOpen={setSidebarOpen} />

        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 text-white cursor-pointer"
        >
          <CirclePlus className="size-5" />
          Create Post
        </Link>
      </div>

      {user && (
        <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
          <div className="flex gap-2 items-center cursor-pointer">
            <UserButton />
            <div>
              <h1 className="text-sm font-medium">{user.full_name}</h1>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
          </div>

          <LogOut
            onClick={() => signOut()}
            className="w-4.5 text-gray-400 hover:text-gray-700 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
