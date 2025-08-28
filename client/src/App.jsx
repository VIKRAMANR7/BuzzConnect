import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
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

export default function App() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };

    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathnameRef.current = window.location.pathname;
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        import.meta.env.VITE_BASE_URL + "/api/message/" + user.id
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Skip connection messages or any message without from_user_id
          if (data.type === "connected" || !data.from_user_id) {
            return;
          }

          // This is a real message
          if (pathnameRef.current === "/messages/" + data.from_user_id._id) {
            dispatch(addMessage(data));
          } else {
            toast.custom((t) => <Notification message={data} t={t} />, {
              position: "bottom-right",
              duration: 4000,
            });
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

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
