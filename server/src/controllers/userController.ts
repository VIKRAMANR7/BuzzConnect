import type { Request, Response } from "express";
import fs from "fs";
import imagekit from "@/configs/imageKit.js";
import { inngest } from "@/inngest/index.js";
import Connection from "@/models/Connection.js";
import Post from "@/models/Post.js";
import User from "@/models/User.js";
import { getAuthUserId } from "@/utils/getAuthUserId.js";
import { handleControllerError } from "@/utils/handleError.js";

export async function getUserData(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);

    const user = await User.findById(userId);
    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, user });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function updateUserData(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);

    let { username, bio, location, full_name } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.json({ success: false, message: "User not found" });
      return;
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

    const files = req.files;

    let profile: Express.Multer.File | undefined;
    let cover: Express.Multer.File | undefined;

    if (files && !Array.isArray(files)) {
      profile = files.profile?.[0];
      cover = files.cover?.[0];
    }

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

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ success: true, user: updatedUser, message: "Profile Updated" });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function discoverUsers(req: Request, res: Response): Promise<void> {
  try {
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
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function followUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    if (user.following.includes(id)) {
      res.json({ success: false, message: "You are already following this user" });
      return;
    }

    user.following.push(id);
    await user.save();

    const targetUser = await User.findById(id);
    if (targetUser) {
      targetUser.followers.push(userId);
      await targetUser.save();
    }

    res.json({ success: true, message: "You are now following this user" });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function unFollowUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    user.following = user.following.filter((item) => item !== id);
    await user.save();

    const targetUser = await User.findById(id);
    if (targetUser) {
      targetUser.followers = targetUser.followers.filter((item) => item !== userId);
      await targetUser.save();
    }

    res.json({ success: true, message: "You have unfollowed this user" });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function sendConnectionRequest(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.body;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gte: last24Hours },
    });

    if (recentRequests.length >= 20) {
      res.json({
        success: false,
        message:
          "You have sent too many connection requests in the last 24 hours. Please try again later.",
      });
      return;
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

      res.json({ success: true, message: "Connection request sent successfully" });
      return;
    }

    if (existing.status === "accepted") {
      res.json({ success: false, message: "You are already connected with this user" });
      return;
    }

    res.json({ success: true, message: "Connection request pending" });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function getUserConnections(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);

    const user = await User.findById(userId).populate("connections followers following");
    if (!user) {
      res.json({ success: false, message: "User not found" });
      return;
    }

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
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function acceptConnectionRequest(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getAuthUserId(req);
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      res.json({ success: false, message: "Connection request not found" });
      return;
    }

    const user = await User.findById(userId);
    const other = await User.findById(id);

    if (!user || !other) {
      res.json({ success: false, message: "User not found" });
      return;
    }

    user.connections.push(id);
    other.connections.push(userId);

    await user.save();
    await other.save();

    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection request accepted" });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}

export async function getUserProfiles(req: Request, res: Response): Promise<void> {
  try {
    const { profileId } = req.body;

    const profile = await User.findById(profileId);
    if (!profile) {
      res.json({ success: false, message: "Profile not found" });
      return;
    }

    const posts = await Post.find({ user: profileId }).populate("user");

    res.json({ success: true, profile, posts });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
}
