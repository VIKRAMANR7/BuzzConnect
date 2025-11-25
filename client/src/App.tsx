import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";

import Notification from "./components/Notification";
import { fetchConnections } from "./features/connections/connectionsSlice";
import { addMessage } from "./features/messages/messagesSlice";
import { fetchUser } from "./features/user/userSlice";

import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import CreatePost from "./pages/CreatePost";
import Discover from "./pages/Discover";
import Feed from "./pages/Feed";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

import { useAppDispatch } from "./app/useAppDispatch";

export default function App() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();

  const dispatch = useAppDispatch();
  const pathnameRef = useRef(pathname);

  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = await getToken();
      if (!token) return;

      dispatch(fetchUser(token));
      dispatch(fetchConnections(token));
    };

    fetchData();
  }, [user, getToken, dispatch]);

  const handleSSEMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected" || !data.from_user_id) return;

        const activeChat = `/messages/${data.from_user_id._id}`;

        if (pathnameRef.current === activeChat) {
          dispatch(addMessage(data));
        } else {
          toast.custom(() => <Notification message={data} />, {
            position: "bottom-right",
            duration: 4000,
          });
        }
      } catch {
        console.error("Error parsing SSE message");
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(`${baseURL}/api/message/${user.id}`);
    eventSource.onmessage = handleSSEMessage;

    return () => eventSource.close();
  }, [user, baseURL, handleSSEMessage]);

  return (
    <>
      <Toaster />

      <Routes>
        {!user ? (
          <Route path="/*" element={<Login />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:userId" element={<ChatBox />} />
            <Route path="connections" element={<Connections />} />
            <Route path="discover" element={<Discover />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileId" element={<Profile />} />
            <Route path="create-post" element={<CreatePost />} />
          </Route>
        )}
      </Routes>
    </>
  );
}
