import type { Request, Response } from "express";
import fs from "fs";
import imagekit from "../configs/imageKit.js";

import Story, { type IStory } from "../models/Story.js";
import User from "../models/User.js";

import { inngest } from "../inngest/index.js";
import { getAuthUserId } from "../utils/getAuthUserId.js";

import { asyncHandler } from "../middleware/asyncHandler.js";

export const addUserStory = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const { content, media_type, background_color } = req.body;
  const media = req.file;

  let media_url = "";

  // Upload media only for image/video stories
  if (media && (media_type === "image" || media_type === "video")) {
    const buffer = fs.readFileSync(media.path);

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: media.originalname,
      folder: "stories",
    });

    media_url = uploaded.url;
  }

  const storyData: IStory = {
    user: userId,
    content,
    media_url,
    media_type,
    background_color,
    views_count: [],
  };

  const story = await Story.create(storyData);

  // Schedule deletion after 24 hrs via Inngest
  await inngest.send({
    name: "app/story.delete",
    data: { storyId: story._id.toString() },
  });

  res.json({ success: true });
});

export const getStories = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Stories include: user's + connections + following
  const userIds = [userId, ...user.connections, ...user.following];

  const stories = await Story.find({ user: { $in: userIds } })
    .populate("user")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    stories,
  });
});
