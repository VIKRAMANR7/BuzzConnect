import type { Request, Response } from "express";
import fs from "fs";

import imagekit from "../configs/imageKit.js";
import Message from "../models/Message.js";
import { getAuthUserId } from "../utils/getAuthUserId.js";

import { asyncHandler } from "../middleware/asyncHandler.js";

const connections = new Map<string, Set<Response>>();

function sendSSE(res: Response, data: unknown, event?: string) {
  if (event) res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function addConnection(userId: string, res: Response) {
  const set = connections.get(userId) ?? new Set<Response>();
  set.add(res);
  connections.set(userId, set);
}

function removeConnection(userId: string, res: Response) {
  const set = connections.get(userId);
  if (!set) return;

  set.delete(res);
  if (set.size === 0) connections.delete(userId);
}

function broadcastToUser(userId: string, payload: unknown, event = "message") {
  const set = connections.get(userId);
  if (!set) return;

  for (const res of set) {
    try {
      sendSSE(res, payload, event);
    } catch {
      try {
        res.end();
      } catch {}
      set.delete(res);
    }
  }

  if (set.size === 0) connections.delete(userId);
}

export function sseController(req: Request, res: Response) {
  const { userId } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  addConnection(userId, res);

  // Notify client about the connection
  sendSSE(res, { connected: true, time: Date.now() }, "system");

  // Heartbeat ping to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 15000);

  const cleanup = () => {
    clearInterval(heartbeat);
    removeConnection(userId, res);
    try {
      res.end();
    } catch {}
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
}

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const from_user_id = await getAuthUserId(req);
  const { to_user_id, text } = req.body;
  const file = req.file;

  let media_url = "";
  const message_type = file ? "image" : "text";

  if (file) {
    const buffer = fs.readFileSync(file.path);

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: file.originalname,
    });

    media_url = imagekit.url({
      path: uploaded.filePath,
      transformation: [{ quality: "auto" }, { format: "webp" }, { width: 1280 }],
    });
  }

  const message = await Message.create({
    from_user_id,
    to_user_id,
    text,
    media_url,
    message_type,
  });

  // Send API response
  res.json({ success: true, message });

  // Send via SSE (real-time)
  const populated = await Message.findById(message._id).populate("from_user_id");
  broadcastToUser(to_user_id, populated, "message");
});

export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);
  const { to_user_id } = req.body;

  const messages = await Message.find({
    $or: [
      { from_user_id: userId, to_user_id },
      { from_user_id: to_user_id, to_user_id: userId },
    ],
  }).sort({ createdAt: -1 });

  // Mark received messages as seen
  await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true });

  res.json({ success: true, messages });
});

export const getUserRecentMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req);

  const messages = await Message.find({ to_user_id: userId })
    .populate("from_user_id to_user_id")
    .sort({ createdAt: -1 });

  res.json({ success: true, messages });
});
