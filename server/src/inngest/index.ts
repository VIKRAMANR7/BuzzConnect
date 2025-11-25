import { Inngest } from "inngest";
import sendEmail from "../configs/nodeMailer.js";
import Connection from "../models/Connection.js";
import Message from "../models/Message.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

export const inngest = new Inngest({ id: "buzzconnect-app" });

interface SimpleUser {
  full_name: string;
  username: string;
  email: string;
}

function safeUser(value: unknown): SimpleUser {
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    return {
      full_name: typeof v.full_name === "string" ? v.full_name : "",
      username: typeof v.username === "string" ? v.username : "",
      email: typeof v.email === "string" ? v.email : "",
    };
  }
  return { full_name: "", username: "", email: "" };
}

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const data = event.data;

    const email = data.email_addresses[0].email_address;
    let username = email.split("@")[0];

    const already = await User.findOne({ username });
    if (already) {
      username = username + Math.floor(Math.random() * 10000);
    }

    await User.create({
      _id: data.id,
      email,
      full_name: `${data.first_name} ${data.last_name}`,
      profile_picture: data.image_url,
      username,
    });
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const data = event.data;

    const updatedUserData = {
      email: data.email_addresses[0].email_address,
      full_name: `${data.first_name} ${data.last_name}`,
      profile_picture: data.image_url,
    };

    await User.findByIdAndUpdate(data.id, updatedUserData);
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const userId: string = event.data.id;

    await Connection.deleteMany({
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    });

    await User.updateMany(
      {},
      {
        $pull: {
          followers: userId,
          following: userId,
          connections: userId,
        },
      }
    );

    await Promise.all([
      Post.deleteMany({ user: userId }),
      Story.deleteMany({ user: userId }),
      Message.deleteMany({
        $or: [{ from_user_id: userId }, { to_user_id: userId }],
      }),
    ]);

    await User.findByIdAndDelete(userId);
  }
);

const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    async function load() {
      const doc = await Connection.findById(connectionId).populate("from_user_id to_user_id");

      if (!doc) return null;

      return {
        status: doc.status,
        from: safeUser(doc.from_user_id),
        to: safeUser(doc.to_user_id),
      };
    }

    await step.run("send-initial-request-mail", async () => {
      const c = await load();
      if (!c) return;

      const subject = "👋 New Connection Request";
      const body = `
        Hi ${c.to.full_name},
        You have a new connection request from ${c.from.full_name} (@${c.from.username}).
      `;

      await sendEmail({
        to: c.to.email,
        subject,
        body,
      });
    });

    const in24Hours = new Date(Date.now() + 86400000);
    await step.sleepUntil("wait-24h", in24Hours);

    await step.run("send-reminder-mail", async () => {
      const c = await load();
      if (!c) return { message: "No connection found" };

      if (c.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = "⏳ Reminder: Pending Connection Request";
      const body = `
        Hi ${c.to.full_name},
        You still have a pending connection request from ${c.from.full_name} (@${c.from.username}).
      `;

      await sendEmail({
        to: c.to.email,
        subject,
        body,
      });

      return { message: "Reminder sent" };
    });
  }
);

const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },
  async ({ event, step }) => {
    const { storyId } = event.data;

    const in24Hours = new Date(Date.now() + 86400000);
    await step.sleepUntil("wait-24h", in24Hours);

    await step.run("remove-story", async () => {
      await Story.findByIdAndDelete(storyId);
      return { message: "Story deleted" };
    });
  }
);

const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-unseen-message-notification" },
  { cron: "TZ=America/New_York 0 9 * * *" },
  async () => {
    const unseen = await Message.find({ seen: false }).populate("to_user_id");

    const counts: Record<string, number> = {};

    unseen.forEach((msg) => {
      const val = msg.to_user_id;

      if (val && typeof val === "object") {
        const obj = val as Record<string, unknown>;
        if (typeof obj._id === "string") {
          const id = obj._id;
          counts[id] = (counts[id] || 0) + 1;
        }
      }
    });

    for (const userId of Object.keys(counts)) {
      const user = await User.findById(userId);
      if (!user) continue;

      const subject = `✉️ You have ${counts[userId]} unseen messages`;
      const body = `
        Hi ${user.full_name},
        You have ${counts[userId]} unread messages waiting for you.
      `;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }

    return { message: "Daily unseen message notifications sent" };
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendNotificationOfUnseenMessages,
];
