import mongoose, { Schema } from "mongoose";

export interface IPost {
  user: string;
  content?: string;
  image_urls: string[];
  post_type?: "text" | "image" | "text_with_image";
  likes_count: string[];
}

const postSchema = new Schema<IPost>(
  {
    user: { type: String, ref: "User", required: true },
    content: { type: String },
    image_urls: [{ type: String }],
    post_type: {
      type: String,
      enum: ["text", "image", "text_with_image"],
    },
    likes_count: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

export const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;
