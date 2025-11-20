import type { Request, Response } from "express";
import fs from "fs";
import imagekit from "@/configs/imageKit.js";
import Story, { type IStory } from "@/models/Story.js";
import User from "@/models/User.js";
import { inngest } from "@/inngest/index.js";
import { getAuthUserId } from "@/utils/getAuthUserId.js";
import { handleControllerError } from "@/utils/handleError.js";

export async function addUserStory(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);

    const { content, media_type, background_color } = req.body;
    const media = req.file;

    let media_url = "";

    // If story has image/video media, upload it to ImageKit to get a reliable URL
    if (media && (media_type === "image" || media_type === "video")) {
      const buffer = fs.readFileSync(media.path);

      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: media.originalname,
        folder: "stories",
      });

      media_url = uploaded.url;
    }

    // Prepare the story data following the schema structure
    const storyData: IStory = {
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
      views_count: [],
    };

    const story = await Story.create(storyData);

    // Trigger a background event to delete this story after 24 hours
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id.toString() },
    });

    res.json({ success: true });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function getStories(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Stories shown include the user's own stories plus those from connections/following
    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await Story.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      stories,
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}
