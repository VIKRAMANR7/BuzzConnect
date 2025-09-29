// sse.controller.js
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Message from "../models/Message.js";

/**
 * Store active SSE connections
 * Map<userId, Set<ServerResponse>>
 * - Supports multiple tabs/windows per user
 */
const connections = new Map();

/** Small helper to send a single SSE event */
function sendSSE(res, data, eventName) {
  if (eventName) res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/** Register a connection for a user */
function addConnection(userId, res) {
  const set = connections.get(userId) ?? new Set();
  set.add(res);
  connections.set(userId, set);
  return set;
}

/** Remove a single res from the user's set; clean if empty */
function removeConnection(userId, res) {
  const set = connections.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) connections.delete(userId);
}

/** Broadcast event to all of a user's open tabs */
function broadcastToUser(userId, payload, eventName = "message") {
  const set = connections.get(userId);
  if (!set || set.size === 0) return;

  for (const res of set) {
    try {
      sendSSE(res, payload, eventName);
    } catch {
      // If a write fails, drop that connection silently
      try {
        res.end();
      } catch {}
      set.delete(res);
    }
  }
  if (set.size === 0) connections.delete(userId);
}

/**
 * SSE Controller
 * - Sends valid SSE frames (every message starts with "data:")
 * - Flushes headers immediately
 * - Disables buffering and compression issues
 * - Sends heartbeats to keep the connection alive
 */
export const sseController = (req, res) => {
  const { userId } = req.params;
  console.log("New client connected: ", userId);

  // IMPORTANT: Proper SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform", // no-transform avoids proxy transformations
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*", // or set to your frontend origin for stricter CORS
    "X-Accel-Buffering": "no", // Nginx: disable response buffering
  });

  // If using compression middleware, make sure to DISABLE it for this route.
  // e.g. app.get('/api/message/:userId', noCompression, sseController);

  // Flush headers so the client receives the stream immediately
  res.flushHeaders?.();

  // Keep the TCP socket alive
  req.socket?.setKeepAlive?.(true);

  // Let the client know how long to wait before retrying (ms)
  // (EventSource has its own default, but this is explicit)
  res.write(`retry: 10000\n`);

  // Register this connection
  addConnection(userId, res);

  // Send a VALID initial event so the client knows we’re connected
  sendSSE(res, { type: "connected", ts: Date.now() }, "system");

  // Heartbeat every 15s; some proxies close idle connections otherwise
  const heartbeat = setInterval(() => {
    // Named event is fine, your client can ignore or use it
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 15000);

  // Cleanup when client disconnects or the request is aborted
  const cleanup = () => {
    clearInterval(heartbeat);
    removeConnection(userId, res);
    try {
      res.end();
    } catch {}
    console.log("Client disconnected");
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
};

/**
 * Send Message (unchanged logic, with robust SSE broadcast)
 */
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    const message_type = image ? "image" : "text";

    if (message_type === "image") {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });
      media_url = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.json({ success: true, message });

    // Populate sender data for the recipient’s notification
    const messageWithUserData = await Message.findById(message._id).populate("from_user_id");

    // Broadcast to ALL open tabs of the recipient
    broadcastToUser(to_user_id, messageWithUserData, "message");

    // (Optional) Also push to sender’s other tabs, e.g., to update their UI
    // broadcastToUser(userId, messageWithUserData, "echo");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * The rest of your handlers can remain as-is
 * (getChatMessages, getUserRecentMessages)
 */
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: -1 });

    await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
