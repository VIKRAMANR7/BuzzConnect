import { useAuth } from "@clerk/clerk-react";
import { MessageSquare, UserCheck, UserPlus, UserRoundPen, Users } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { fetchConnections } from "../features/connections/connectionsSlice";
import type { RootState } from "../types/store";
import type { DisplayUser } from "../types/user";
import { useAppDispatch } from "../app/useAppDispatch";

export default function Connections() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { getToken } = useAuth();

  const [currentTab, setCurrentTab] = useState("Followers");

  const { followers, following, pendingConnections, connections } = useSelector(
    (s: RootState) => s.connections
  );

  // Reload connections
  const reloadConnections = useCallback(async () => {
    const token = await getToken();
    if (token) dispatch(fetchConnections(token));
  }, [dispatch, getToken]);

  // Unfollow a user
  const handleUnfollow = useCallback(
    async (userId: string) => {
      try {
        const token = await getToken();
        if (!token) return;
        const { data } = await api.post(
          "/api/user/unfollow",
          { id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data.success ? toast.success(data.message) : toast.error(data.message);
        await reloadConnections();
      } catch {
        toast.error("Unable to unfollow user");
      }
    },
    [getToken, reloadConnections]
  );

  // Accept connection request
  const acceptConnection = useCallback(
    async (userId: string) => {
      try {
        const token = await getToken();
        if (!token) return;
        const { data } = await api.post(
          "/api/user/accept",
          { id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data.success ? toast.success(data.message) : toast.error(data.message);
        await reloadConnections();
      } catch {
        toast.error("Unable to accept connection");
      }
    },
    [getToken, reloadConnections]
  );

  // load on mount
  useEffect(() => {
    reloadConnections();
  }, [reloadConnections]);

  // tabs memoized to avoid re-creating array on each render (helpful if passed down)
  const tabs = useMemo(
    () => [
      { label: "Followers", value: followers as DisplayUser[], icon: Users },
      { label: "Following", value: following as DisplayUser[], icon: UserCheck },
      { label: "Pending", value: pendingConnections as DisplayUser[], icon: UserRoundPen },
      { label: "Connections", value: connections as DisplayUser[], icon: UserPlus },
    ],
    [followers, following, pendingConnections, connections]
  );

  const activeTab = tabs.find((t) => t.label === currentTab) ?? tabs[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
          <p className="text-slate-600">Manage your network and discover new connections</p>
        </div>

        {/* Counts */}
        <div className="mb-8 flex flex-wrap gap-6">
          {tabs.map((tab) => (
            <div
              key={tab.label}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md"
            >
              <b>{tab.value.length}</b>
              <p className="text-slate-600">{tab.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center px-3 py-1 text-sm cursor-pointer rounded-md transition-colors ${
                currentTab === tab.label
                  ? "bg-white font-medium text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <tab.icon className="size-4" />
              <span className="ml-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Users */}
        <div className="flex flex-wrap gap-6 mt-6">
          {activeTab.value.map((user) => (
            <div
              key={user._id}
              className="w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md"
            >
              <img src={user.profile_picture} className="rounded-full w-12 h-12 shadow-md" alt="" />

              <div className="flex-1">
                <p className="font-medium text-slate-700">{user.full_name}</p>
                <p className="text-slate-500">@{user.username}</p>
                <p className="text-sm text-gray-600">{user.bio?.slice(0, 30)}...</p>

                <div className="flex max-sm:flex-col gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="w-full p-2 text-sm rounded bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
                  >
                    View Profile
                  </button>

                  {currentTab === "Following" && (
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer"
                    >
                      Unfollow
                    </button>
                  )}

                  {currentTab === "Pending" && (
                    <button
                      onClick={() => acceptConnection(user._id)}
                      className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer"
                    >
                      Accept
                    </button>
                  )}

                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="size-4" />
                      Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
