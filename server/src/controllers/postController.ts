import type { Request, Response } from "express";
import fs from "fs";
import imagekit from "@/configs/imageKit.js";
import Post, { type IPost } from "@/models/Post.js";
import User from "@/models/User.js";
import { getAuthUserId } from "@/utils/getAuthUserId.js";
import { handleControllerError } from "@/utils/handleError.js";

export async function addPost(req: Request, res: Response): Promise<void> {
  try {
    // Validates authentication and ensures we always get a usable user ID
    const userId = await getAuthUserId(req);

    const { content, post_type } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    let image_urls: string[] = [];

    if (files && files.length > 0) {
      // Convert temporary uploaded files into ImageKit-hosted URLs so posts load faster
      image_urls = await Promise.all(
        files.map(async (file) => {
          const buffer = fs.readFileSync(file.path);

          const uploaded = await imagekit.upload({
            file: buffer,
            fileName: file.originalname,
            folder: "posts",
          });

          // Generate an optimized WebP version for consistent frontend rendering
          return imagekit.url({
            path: uploaded.filePath,
            transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
          });
        })
      );
    }

    // Construct the post document based on the schema
    const newPost: IPost = {
      user: userId,
      content,
      image_urls,
      post_type,
      likes_count: [],
    };

    await Post.create(newPost);

    res.json({
      success: true,
      message: "Post added successfully",
    });
  } catch (error: unknown) {
    // Centralized error handling keeps controllers clean
    handleControllerError(res, error);
  }
}

export async function getFeedPosts(req: Request, res: Response): Promise<void> {
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

    // Feed includes posts from self, followed users, and connections
    const userIds = [userId, ...user.connections, ...user.following];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function likePost(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);
    const { postId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const liked = post.likes_count.includes(userId);

    if (liked) {
      // If already liked, remove the like
      post.likes_count = post.likes_count.filter((id) => id !== userId);
      await post.save();

      res.json({
        success: true,
        message: "Post unliked",
      });
      return;
    }

    // Add user to likes list for this post
    post.likes_count.push(userId);
    await post.save();

    res.json({
      success: true,
      message: "Post liked",
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}
