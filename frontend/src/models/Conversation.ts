import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IMessage, MessageSchema } from "./Message";

export interface IConversation extends Document {
  userId: string;
  title: string;
  messageCount: number;
  preview: string;
  pinned: boolean;
  folder?: string;
  messages: Types.DocumentArray<IMessage>;
}

export const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    messageCount: { type: Number, default: 0 },
    preview: { type: String, default: "No messages yet" },
    pinned: { type: Boolean, default: false },
    folder: { type: String },
    messages: [{ type: MessageSchema, default: [] }],
  },
  { timestamps: true }
);

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
