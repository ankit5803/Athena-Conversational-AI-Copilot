import mongoose, { Schema, Document, Model } from "mongoose";

export type Role = "user" | "assistant";

export interface IMessage extends Document {
  role: Role;
  content: string;
}

export const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
