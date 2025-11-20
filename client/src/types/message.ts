import type { DisplayUser } from "@/types/user";

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: string;
  message_type: "text" | "image";
  media_url?: string;
  from_user_id: DisplayUser;
  to_user_id: string;
}
