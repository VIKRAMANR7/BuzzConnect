import mongoose, { Schema } from "mongoose";

export interface IStory {
  user: string;
  content?: string;
  media_url?: string;
  media_type?: "text" | "image" | "video";
  views_count: string[];
  background_color?: string;
}

const storySchema = new Schema<IStory>(
  {
    user: { type: String, ref: "User", required: true },
    content: { type: String },
    media_url: { type: String },
    media_type: { type: String, enum: ["text", "image", "video"] },
    views_count: [{ type: String, ref: "User" }],
    background_color: { type: String },
  },
  { timestamps: true, minimize: false }
);

export const Story = mongoose.model<IStory>("Story", storySchema);
export default Story;
