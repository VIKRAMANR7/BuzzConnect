import { BadgeCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Story } from "../types/story";

interface StoryViewerProps {
  viewStory: Story;
  setViewStory: (story: Story | null) => void;
}

const STORY_DURATION = 10000;
const PROGRESS_STEP = 100;

export default function StoryViewer({ viewStory, setViewStory }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    let interval: number | undefined;

    if (viewStory.media_type !== "video") {
      setProgress(0);

      let elapsed = 0;

      interval = setInterval(() => {
        elapsed += PROGRESS_STEP;
        setProgress((elapsed / STORY_DURATION) * 100);
      }, PROGRESS_STEP);

      timer = setTimeout(() => setViewStory(null), STORY_DURATION);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [viewStory, setViewStory]);

  const renderContent = () => {
    if (viewStory.media_type === "image") {
      return <img src={viewStory.media_url} className="max-w-full max-h-screen object-contain" />;
    }

    if (viewStory.media_type === "video") {
      return (
        <video
          controls
          autoPlay
          onEnded={() => setViewStory(null)}
          src={viewStory.media_url}
          className="max-h-screen"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
        {viewStory.content}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 h-screen z-110 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text" ? (viewStory.background_color ?? "#000") : "#000",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute top-4 left-4 flex items-center space-x-3 p-4 backdrop-blur rounded bg-black/50">
        <img
          src={viewStory.user.profile_picture}
          className="size-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      <button onClick={() => setViewStory(null)} className="absolute top-4 right-4 text-white">
        <X className="size-8 hover:scale-110 transition cursor-pointer" />
      </button>

      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}
