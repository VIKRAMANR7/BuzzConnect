import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import type { StoryModalProps } from "../types/story-modal";

export default function StoryModal({ setShowModal, fetchStories }: StoryModalProps) {
  const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"];

  const [mode, setMode] = useState<"text" | "media">("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE_MB = 50;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video")) {
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`Video size should be less than ${MAX_VIDEO_SIZE_MB} MB`);
        setMedia(null);
        setPreviewUrl(null);
        return;
      }

      // Validate duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);

        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error("Video duration cannot exceed 1 minute");
          setMedia(null);
          setPreviewUrl(null);
          return;
        }

        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
        setText("");
        setMode("media");
      };
    }

    if (file.type.startsWith("image")) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setText("");
      setMode("media");
    }
  };

  const handleCreateStory = async () => {
    const mediaType =
      mode === "media" ? (media?.type.startsWith("image") ? "image" : "video") : "text";

    if (mediaType === "text" && !text.trim()) {
      throw new Error("Please enter some text");
    }

    const formData = new FormData();
    formData.append("content", text);
    formData.append("media_type", mediaType);
    formData.append("background_color", background);

    if (media) {
      formData.append("media", media);
    }

    try {
      const token = await getToken();

      const { data } = await api.post("/api/story/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Story created successfully");
        setShowModal(false);
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button onClick={() => setShowModal(false)} className="text-white p-2 cursor-pointer">
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10" />
        </div>

        {/* Story Preview */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-full resize-none bg-transparent text-white p-6 focus:outline-none text-lg"
            />
          )}

          {mode === "media" && previewUrl && (
            <>
              {media?.type.startsWith("image") ? (
                <img src={previewUrl} className="object-contain max-h-full" />
              ) : (
                <video src={previewUrl} className="object-contain max-h-full" />
              )}
            </>
          )}
        </div>

        {/* Background Colors */}
        <div className="flex mt-4 gap-2">
          {bgColors.map((color) => (
            <button
              key={color}
              onClick={() => setBackground(color)}
              style={{ backgroundColor: color }}
              className="w-6 h-6 rounded-full ring cursor-pointer"
            />
          ))}
        </div>

        {/* Mode Switch */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>

          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input
              type="file"
              accept="image/*, video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        {/* Submit */}
        <button
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving...",
            })
          }
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer"
        >
          <Sparkle size={18} /> Create Story
        </button>
      </div>
    </div>
  );
}
