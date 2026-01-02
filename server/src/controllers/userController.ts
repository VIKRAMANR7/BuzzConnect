import type { Request, Response } from "express";
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";

import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

import { getAuthUserId } from "../utils/getAuthUserId.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const user = await User.findById(userId);
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  res.json({ success: true, user });
});

export const updateUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  let { username } = req.body;
  const { bio, location, full_name } = req.body;

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    return res.json({ success: false, message: "User not found" });
  }

  if (!username) {
    username = existingUser.username;
  }

  if (existingUser.username !== username) {
    const userWithSameUsername = await User.findOne({ username });
    if (userWithSameUsername) {
      username = existingUser.username;
    }
  }

  const updatedData: Record<string, string | undefined> = {
    username,
    bio,
    location,
    full_name,
  };

  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  const profile = files?.profile?.[0];
  const cover = files?.cover?.[0];

  if (profile) {
    const buffer = fs.readFileSync(profile.path);

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: profile.originalname,
    });

    const url = imagekit.url({
      path: uploaded.filePath,
      transformation: [{ quality: "auto" }, { format: "webp" }, { width: 512 }],
    });

    updatedData.profile_picture = url;
  }

  if (cover) {
    const buffer = fs.readFileSync(cover.path);

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: cover.originalname,
    });

    const url = imagekit.url({
      path: uploaded.filePath,
      transformation: [{ quality: "auto" }, { format: "webp" }, { width: 1280 }],
    });

    updatedData.cover_photo = url;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
    new: true,
  });

  res.json({ success: true, user: updatedUser, message: "Profile Updated" });
});

export const discoverUsers = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { input } = req.body;

  const allUsers = await User.find({
    $or: [
      { username: new RegExp(input, "i") },
      { email: new RegExp(input, "i") },
      { full_name: new RegExp(input, "i") },
      { location: new RegExp(input, "i") },
    ],
  });

  const filteredUsers = allUsers.filter((user) => user._id.toString() !== userId);

  res.json({ success: true, users: filteredUsers });
});

export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { id } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.json({ success: false, message: "User not found" });

  if (user.following.includes(id)) {
    return res.json({ success: false, message: "You are already following this user" });
  }

  user.following.push(id);
  await user.save();

  const targetUser = await User.findById(id);
  if (targetUser) {
    targetUser.followers.push(userId);
    await targetUser.save();
  }

  res.json({ success: true, message: "You are now following this user" });
});

export const unFollowUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { id } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.json({ success: false, message: "User not found" });

  user.following = user.following.filter((item) => item !== id);
  await user.save();

  const targetUser = await User.findById(id);
  if (targetUser) {
    targetUser.followers = targetUser.followers.filter((item) => item !== userId);
    await targetUser.save();
  }

  res.json({ success: true, message: "You have unfollowed this user" });
});

export const sendConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { id } = req.body;

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRequests = await Connection.find({
    from_user_id: userId,
    createdAt: { $gte: last24Hours },
  });

  if (recentRequests.length >= 20) {
    return res.json({
      success: false,
      message: "Too many connection requests in 24 hours. Please try again later.",
    });
  }

  const existing = await Connection.findOne({
    $or: [
      { from_user_id: userId, to_user_id: id },
      { from_user_id: id, to_user_id: userId },
    ],
  });

  if (!existing) {
    const newConnection = await Connection.create({
      from_user_id: userId,
      to_user_id: id,
    });

    await inngest.send({
      name: "app/connection-request",
      data: { connectionId: newConnection._id.toString() },
    });

    return res.json({ success: true, message: "Connection request sent successfully" });
  }

  if (existing.status === "accepted") {
    return res.json({ success: false, message: "You are already connected with this user" });
  }

  res.json({ success: true, message: "Connection request pending" });
});

export const getUserConnections = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const user = await User.findById(userId).populate("connections followers following");
  if (!user) return res.json({ success: false, message: "User not found" });

  const pendingConnections = (
    await Connection.find({
      to_user_id: userId,
      status: "pending",
    }).populate("from_user_id")
  ).map((c) => c.from_user_id);

  res.json({
    success: true,
    connections: user.connections,
    followers: user.followers,
    following: user.following,
    pendingConnections,
  });
});

export const acceptConnectionRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { id } = req.body;

  const connection = await Connection.findOne({
    from_user_id: id,
    to_user_id: userId,
  });

  if (!connection) {
    return res.json({ success: false, message: "Connection request not found" });
  }

  const user = await User.findById(userId);
  const other = await User.findById(id);

  if (!user || !other) {
    return res.json({ success: false, message: "User not found" });
  }

  user.connections.push(id);
  other.connections.push(userId);

  await user.save();
  await other.save();

  connection.status = "accepted";
  await connection.save();

  res.json({ success: true, message: "Connection request accepted" });
});

export const getUserProfiles = asyncHandler(async (req: Request, res: Response) => {
  const { profileId } = req.body;

  const profile = await User.findById(profileId);
  if (!profile) {
    return res.json({ success: false, message: "Profile not found" });
  }

  const posts = await Post.find({ user: profileId }).populate("user");

  res.json({ success: true, profile, posts });
});
