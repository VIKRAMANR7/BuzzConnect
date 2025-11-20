import type { DisplayUser } from "@/types/user";

export interface Story {
  _id: string;
  content?: string;
  createdAt: string;
  media_type: "text" | "image" | "video";
  media_url?: string;
  user: DisplayUser;
  background_color?: string;
}
