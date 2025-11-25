import { Menu, X } from "lucide-react";
import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import Sidebar from "../components/Sidebar";
import type { RootState } from "../types/store";

export default function Layout() {
  const user = useSelector((state: RootState) => state.user.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return user ? (
    <div className="w-full flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>

      {sidebarOpen ? (
        <X
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow size-10 text-gray-600 sm:hidden"
          onClick={toggleSidebar}
        />
      ) : (
        <Menu
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow size-10 text-gray-600 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
}
