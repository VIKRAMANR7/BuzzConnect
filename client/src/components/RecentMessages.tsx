import { useAuth, useUser } from "@clerk/clerk-react";
import moment from "moment";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import api from "@/api/axios";

interface RecentMessage {
  _id: string;
  text?: string;
  createdAt: string;
  seen: boolean;
  from_user_id: {
    _id: string;
    full_name: string;
    profile_picture: string;
  };
}

export default function RecentMessages() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [messages, setMessages] = useState<RecentMessage[]>([]);

  const fetchRecent = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const grouped: Record<string, RecentMessage> = {};

      (data.messages as RecentMessage[]).forEach((msg) => {
        const sender = msg.from_user_id._id;
        if (!grouped[sender] || new Date(msg.createdAt) > new Date(grouped[sender].createdAt)) {
          grouped[sender] = msg;
        }
      });

      const sorted = Object.values(grouped).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMessages(sorted);
    } catch {
      toast.error("Unable to fetch recent messages");
    }
  }, [getToken]);

  useEffect(() => {
    if (!user) return;

    fetchRecent();
    const interval = setInterval(fetchRecent, 30_000);
    return () => clearInterval(interval);
  }, [user, fetchRecent]);

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold mb-4">Recent Messages</h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {messages.map((msg) => (
          <Link
            key={msg._id}
            to={`/messages/${msg.from_user_id._id}`}
            className="flex items-start gap-2 py-2 hover:bg-slate-100"
          >
            <img src={msg.from_user_id.profile_picture} className="w-8 h-8 rounded-full" />

            <div className="w-full">
              <div className="flex justify-between">
                <p className="font-medium">{msg.from_user_id.full_name}</p>
                <p className="text-[10px] text-slate-400">{moment(msg.createdAt).fromNow()}</p>
              </div>

              <div className="flex justify-between">
                <p className="text-gray-500">{msg.text || "Media"}</p>

                {!msg.seen && (
                  <p className="bg-indigo-500 text-white size-4 flex items-center justify-center rounded-full text-[10px]">
                    1
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
