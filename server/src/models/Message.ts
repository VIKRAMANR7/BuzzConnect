import mongoose, { Schema } from "mongoose";

export interface IMessage {
  from_user_id: string;
  to_user_id: string;
  text?: string;
  message_type?: "text" | "image";
  media_url?: string;
  seen: boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    from_user_id: { type: String, ref: "User", required: true },
    to_user_id: { type: String, ref: "User", required: true },
    text: { type: String, trim: true },
    message_type: { type: String, enum: ["text", "image"] },
    media_url: { type: String },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
