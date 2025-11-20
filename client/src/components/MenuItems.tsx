import { NavLink } from "react-router-dom";
import { useCallback } from "react";
import { menuItemsData } from "@/assets/assets";

interface MenuItemsProps {
  setSidebarOpen: (value: boolean) => void;
}

export default function MenuItems({ setSidebarOpen }: MenuItemsProps) {
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  return (
    <div className="px-6 text-gray-600 space-y-1 font-medium">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={closeSidebar}
          className={({ isActive }) =>
            `px-3.5 py-2 flex items-center gap-3 rounded-xl ${
              isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"
            }`
          }
        >
          <Icon className="size-5" />
          {label}
        </NavLink>
      ))}
    </div>
  );
}
