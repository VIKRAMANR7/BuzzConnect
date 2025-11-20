import mongoose, { Schema } from "mongoose";

export interface IConnection {
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted";
}

const connectionSchema = new Schema<IConnection>(
  {
    from_user_id: { type: String, ref: "User", required: true },
    to_user_id: { type: String, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Connection = mongoose.model<IConnection>("Connection", connectionSchema);
export default Connection;
