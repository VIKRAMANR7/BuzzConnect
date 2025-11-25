import { useAuth } from "@clerk/clerk-react";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import type { RootState } from "../types/store";
import type { Post } from "../types/post";

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const currentUser = useSelector((state: RootState) => state.user.value);
  const [likes, setLikes] = useState<string[]>(post.likes_count);

  const postWithHashtags = useMemo(
    () => post.content.replace(/(#\w+)/g, "<span class='text-indigo-600'>$1</span>"),
    [post.content]
  );

  const handleLike = useCallback(async () => {
    if (!currentUser) return;

    try {
      const token = await getToken();

      const { data } = await api.post(
        "/api/post/like",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setLikes((prev) =>
          prev.includes(currentUser._id)
            ? prev.filter((id) => id !== currentUser._id)
            : [...prev, currentUser._id]
        );
      } else toast.error(data.message);
    } catch {
      toast.error("Unable to like post");
    }
  }, [currentUser, getToken, post._id]);

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      {/* Header */}
      <div
        className="inline-flex items-center gap-3 cursor-pointer"
        onClick={() => navigate(`/profile/${post.user._id}`)}
      >
        <img
          src={post.user.profile_picture}
          alt={post.user.full_name}
          className="size-10 rounded-full shadow"
        />

        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="size-4 text-blue-500" />
          </div>
          <p className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Images */}
      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img) => (
          <img
            key={img}
            src={img}
            alt="Post media"
            className={`w-full h-48 object-cover rounded-lg ${
              post.image_urls.length === 1 ? "col-span-2 h-auto" : ""
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <button onClick={handleLike} className="flex items-center gap-1 cursor-pointer">
          <Heart
            className={`size-4 ${
              currentUser && likes.includes(currentUser._id) ? "text-red-500 fill-red-500" : ""
            }`}
          />
          <span>{likes.length}</span>
        </button>

        <div className="flex items-center gap-1">
          <MessageCircle className="size-4" />
          <span>12</span>
        </div>

        <div className="flex items-center gap-1">
          <Share2 className="size-4" />
          <span>12</span>
        </div>
      </div>
    </div>
  );
}
