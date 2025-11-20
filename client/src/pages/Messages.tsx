import { Eye, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState } from "@/types/store";
import type { SimpleUser } from "@/types/user";

export default function Messages() {
  const navigate = useNavigate();

  const { connections } = useSelector((state: RootState) => state.connections);

  const users = connections as SimpleUser[];

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user._id} className="max-w-xl flex flex-wrap gap-5 p-6 bg-white rounded-md">
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="rounded-full size-12 mx-auto"
              />

              <div className="flex-1">
                <p className="font-medium text-slate-700">{user.full_name}</p>
                <p className="text-slate-500">@{user.username}</p>
                <p className="text-sm text-gray-600">{user.bio}</p>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className="size-10 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
                >
                  <MessageSquare className="size-4" />
                </button>

                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="size-10 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer"
                >
                  <Eye className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
