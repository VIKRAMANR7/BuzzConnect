import { useAuth } from "@clerk/clerk-react";
import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

import api from "../api/axios";
import { fetchUser } from "../features/user/userSlice";
import type { RootState } from "../types/store";
import type { DisplayUser } from "../types/user";
import { useAppDispatch } from "../app/useAppDispatch";

interface Props {
  user: DisplayUser;
}

export default function UserCard({ user }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const currentUser = useSelector((state: RootState) => state.user.value);

  const handleFollow = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Unable to follow user");
    }
  }, [getToken, user._id, dispatch]);

  const handleConnection = useCallback(async () => {
    if (currentUser?.connections.includes(user._id)) {
      navigate(`/messages/${user._id}`);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch {
      toast.error("Unable to send connection request");
    }
  }, [getToken, user._id, currentUser, navigate]);

  const isFollowing = Boolean(currentUser?.following.includes(user._id));
  const isConnected = Boolean(currentUser?.connections.includes(user._id));

  return (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md">
      <div className="text-center">
        <img src={user.profile_picture} className="rounded-full w-16 mx-auto shadow-md" />
        <p className="mt-4 font-semibold">{user.full_name}</p>

        {user.username && <p className="text-gray-500">@{user.username}</p>}
        {user.bio && <p className="text-gray-500 mt-2 text-center text-sm px-4">{user.bio}</p>}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <MapPin className="size-4" /> {user.location}
        </div>

        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <span>{user.followers.length}</span> Followers
        </div>
      </div>

      <div className="flex mt-4 gap-2">
        <button
          onClick={handleFollow}
          disabled={isFollowing}
          className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
        >
          <UserPlus className="size-4" />
          {isFollowing ? "Following" : "Follow"}
        </button>

        <button
          onClick={handleConnection}
          className="flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition"
        >
          {isConnected ? (
            <MessageCircle className="size-5 group-hover:scale-105 transition" />
          ) : (
            <Plus className="size-5 group-hover:scale-105 transition" />
          )}
        </button>
      </div>
    </div>
  );
}
