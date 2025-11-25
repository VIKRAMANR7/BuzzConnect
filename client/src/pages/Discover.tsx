import { useAuth } from "@clerk/clerk-react";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import Loading from "../components/Loading";
import UserCard from "../components/UserCard";
import { fetchUser } from "../features/user/userSlice";

import type { DisplayUser } from "../types/user";
import { useAppDispatch } from "../app/useAppDispatch";

export default function Discover() {
  const dispatch = useAppDispatch();
  const { getToken } = useAuth();

  const [input, setInput] = useState("");
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;

      try {
        setLoading(true);
        setUsers([]);

        const token = await getToken();
        const { data } = await api.post(
          "/api/user/discover",
          { input },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error("Unable to search users");
      } finally {
        setLoading(false);
        setInput("");
      }
    },
    [input, getToken]
  );

  useEffect(() => {
    getToken().then((token) => {
      if (token) dispatch(fetchUser(token));
    });
  }, [getToken, dispatch]);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
        <p className="text-slate-600">Connect with amazing people and grow your network</p>

        {/* Search Bar */}
        <div className="mt-8 mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="flex flex-wrap gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
}
