import type { Request, Response } from "express";
import fs from "fs";

import imagekit from "../configs/imageKit.js";
import Post, { type IPost } from "../models/Post.js";
import User from "../models/User.js";
import { getAuthUserId } from "../utils/getAuthUserId.js";

import { asyncHandler } from "../middleware/asyncHandler.js";

export const addPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const { content, post_type } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  let image_urls: string[] = [];

  if (files && files.length > 0) {
    image_urls = await Promise.all(
      files.map(async (file) => {
        const buffer = fs.readFileSync(file.path);

        const uploaded = await imagekit.upload({
          file: buffer,
          fileName: file.originalname,
          folder: "posts",
        });

        return imagekit.url({
          path: uploaded.filePath,
          transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
        });
      })
    );
  }

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
});

export const getFeedPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const userIds = [userId, ...user.connections, ...user.following];

  const posts = await Post.find({ user: { $in: userIds } })
    .populate("user")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    posts,
  });
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { postId } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  const alreadyLiked = post.likes_count.includes(userId);

  if (alreadyLiked) {
    post.likes_count = post.likes_count.filter((id) => id !== userId);
    await post.save();

    return res.json({
      success: true,
      message: "Post unliked",
    });
  }

  post.likes_count.push(userId);
  await post.save();

  res.json({
    success: true,
    message: "Post liked",
  });
});
