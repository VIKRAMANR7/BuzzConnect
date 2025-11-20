import { useAuth } from "@clerk/clerk-react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import api from "@/api/axios";
import { addMessage, fetchMessages, resetMessages } from "@/features/messages/messagesSlice";
import type { RootState } from "@/types/store";
import type { DisplayUser } from "@/types/user";
import { useAppDispatch } from "@/app/useAppDispatch";
import type { ChatMessage } from "@/types/message";

export default function ChatBox() {
  const dispatch = useAppDispatch();
  const { getToken } = useAuth();
  const { userId } = useParams<{ userId?: string }>();

  const messages = useSelector((s: RootState) => s.messages.messages) as ChatMessage[];
  const connections = useSelector((s: RootState) => s.connections.connections);

  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [otherUser, setOtherUser] = useState<DisplayUser | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // load messages for this chat
  const loadMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const token = await getToken();
      if (!token) return;
      // dispatch typed with useAppDispatch so this is allowed
      dispatch(fetchMessages({ token, userId }));
    } catch {
      toast.error("Unable to load messages");
    }
  }, [userId, getToken, dispatch]);

  // send message (text or image)
  const sendMessage = useCallback(async () => {
    if (!userId) return;
    if (!text.trim() && !image) return;

    try {
      const token = await getToken();
      if (!token) return;

      const form = new FormData();
      form.append("to_user_id", userId);
      form.append("text", text);
      if (image) form.append("image", image);

      const { data } = await api.post("/api/message/send", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Unable to send message");
    }
  }, [userId, text, image, getToken, dispatch]);

  // effect: load messages when userId changes
  useEffect(() => {
    loadMessages();
    return () => {
      dispatch(resetMessages());
    };
  }, [loadMessages, dispatch]);

  // derive the other user from connections list
  useEffect(() => {
    const found = connections.find((c) => c._id === userId) || null;
    setOtherUser(found ?? null);
  }, [connections, userId]);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // memoized sorted messages
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  if (!otherUser) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img src={otherUser.profile_picture} className="size-8 rounded-full" alt="" />
        <div>
          <p className="font-medium">{otherUser.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {sortedMessages.map((message, index) => {
            // message.to_user_id is the recipient id in your backend schema,
            // determine whether the message was sent by current user by comparing to otherUser._id
            const isSentByMe = message.to_user_id !== otherUser._id;

            return (
              <div
                key={index}
                className={`flex flex-col ${isSentByMe ? "items-start" : "items-end"}`}
              >
                <div
                  className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                    isSentByMe ? "rounded-bl-none" : "rounded-br-none"
                  }`}
                >
                  {message.message_type === "image" && message.media_url && (
                    <img
                      src={message.media_url}
                      className="w-full max-w-sm rounded-lg mb-1"
                      alt=""
                    />
                  )}
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 rounded-full shadow mb-5">
          <input
            type="text"
            className="flex-1 outline-none text-slate-700"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <label htmlFor="image">
            {image ? (
              <img src={URL.createObjectURL(image)} className="h-8 rounded" alt="" />
            ) : (
              <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setImage(f);
              }}
            />
          </label>

          <button
            onClick={sendMessage}
            className="bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
