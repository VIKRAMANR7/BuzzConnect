import { Image, X } from "lucide-react";
import { useState, useCallback, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import api from "../api/axios";
import type { RootState } from "../types/store";

export default function CreatePost() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const user = useSelector((state: RootState) => state.user.value);

  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setImages((prev) => [...prev, ...Array.from(list)]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content && images.length === 0) {
      toast.error("Please add text or at least one image");
      return;
    }

    setLoading(true);

    const postType =
      images.length && content ? "text_with_image" : images.length ? "image" : "text";

    const form = new FormData();
    form.append("content", content);
    form.append("post_type", postType);
    images.forEach((img) => form.append("images", img));

    const token = await getToken();

    const { data } = await api.post("/api/post/add", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      toast.success("Post added");
      navigate("/");
    } else {
      toast.error(data.message || "Failed to publish post");
    }

    setLoading(false);
  }, [content, images, getToken, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Post</h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>

        <div className="max-w-xl bg-white p-6 rounded-xl shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt={user.full_name}
              className="size-12 rounded-full shadow"
            />
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>

          <textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400"
          />

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="Selected media"
                    className="h-20 rounded-md"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="size-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-300">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <Image className="size-6" />
              <input type="file" multiple accept="image/*" hidden onChange={handleImageUpload} />
            </label>

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="text-sm bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white font-medium px-8 py-2 rounded-md cursor-pointer"
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
