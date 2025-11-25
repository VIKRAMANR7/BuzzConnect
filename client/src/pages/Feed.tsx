import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import StoriesBar from "../components/StoriesBar";

import type { Post } from "../types/post";

export default function Feed() {
  const { getToken } = useAuth();

  const [feeds, setFeeds] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();
      const { data } = await api.get("/api/post/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setFeeds(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Unable to load feed");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  return loading ? (
    <Loading />
  ) : (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img src={assets.sponsored_img} className="w-75 h-50 rounded-md" />
          <p className="text-slate-600">Email Marketing</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use platform.
          </p>
        </div>
        <RecentMessages />
      </div>
    </div>
  );
}
