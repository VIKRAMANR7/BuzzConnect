import { useAuth } from "@clerk/clerk-react";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import ProfileModal from "../components/ProfileModal";
import UserProfileInfo from "../components/UserProfileInfo";

import type { RootState } from "../types/store";
import type { DisplayUser } from "../types/user";
import type { Post } from "../types/post";

export default function Profile() {
  const currentUser = useSelector((state: RootState) => state.user.value);

  const { getToken } = useAuth();
  const { profileId } = useParams();

  const [user, setUser] = useState<DisplayUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">("posts");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchUserProfile(id: string) {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/profiles",
        { profileId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts);
      } else {
        toast.error(data.message);
      }
    }

    const idToLoad = profileId || currentUser?._id;
    if (idToLoad) fetchUserProfile(idToLoad);
  }, [profileId, currentUser, getToken]);

  if (!user) return <Loading />;

  return (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="h-40 md:h-56 bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img src={user.cover_photo} className="w-full h-full object-cover" />
            )}
          </div>

          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => {
              const t = tab as "posts" | "media" | "likes";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === t
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>

          {activeTab === "posts" && (
            <div>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {activeTab === "media" && (
            <div className="flex flex-wrap mt-6 max-w-6xl">
              {posts
                .filter((p) => p.image_urls.length > 0)
                .map((post) =>
                  post.image_urls.map((image, index) => (
                    <Link key={index} to={image} target="_blank" className="group relative">
                      <img src={image} className="w-64 aspect-video object-cover" />
                      <p className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300">
                        Posted {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  ))
                )}
            </div>
          )}
        </div>
      </div>

      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </div>
  );
}
