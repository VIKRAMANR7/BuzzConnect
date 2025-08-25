import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData } from "../assets/assets";

export default function PostCard({ post }) {
  const postWithHashtags = post.content.replace(
    /(#\w+)/g,
    "<span class='text-indigo-600'>$1</span>"
  );

  const [likes, setLikes] = useState(post.likes_count);
  const currentUser = dummyUserData;
  const handleLike = async () => {};

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      {/* User Info */}
      <div
        onClick={() => navigate("/profile/" + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user.profile_picture}
          alt=""
          className="size-10 rounded-full shadow"
        />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="size-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} &bull; {moment(post.createdAt).fromNow()}
          </div>
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
        {post.image_urls.map((img, index) => (
          <img
            src={img}
            key={index}
            className={`w-full h-48 object-cover rounded-lg ${
              post.image_urls.length === 1 && "col-span-2 h-auto"
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            onClick={handleLike}
            className={`size-4 cursor-pointer ${
              likes.includes(currentUser._id) && "text-red-500 fill-red-500"
            }`}
          />
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="size-4" />
          <span>{12}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="size-4" />
          <span>{12}</span>
        </div>
      </div>
    </div>
  );
}
