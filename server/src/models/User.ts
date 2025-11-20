import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  profile_picture: string;
  cover_photo: string;
  location: string;
  followers: string[];
  following: string[];
  connections: string[];
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    full_name: { type: String, required: true },
    username: { type: String, required: true },

    bio: { type: String, default: "Hey there! I'm using BuzzConnect." },
    profile_picture: { type: String, default: "" },
    cover_photo: { type: String, default: "" },
    location: { type: String, default: "" },

    followers: [{ type: String, ref: "User" }],
    following: [{ type: String, ref: "User" }],
    connections: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

export const User = mongoose.model<IUser>("User", userSchema);
export default User;
