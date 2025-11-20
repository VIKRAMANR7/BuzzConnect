import type { DisplayUser } from "@/types/user";

export interface Post {
  _id: string;
  content: string;
  image_urls: string[];
  createdAt: string;

  // Array of userIds that liked this post
  likes_count: string[];

  // The user who created the post
  user: DisplayUser;
}
