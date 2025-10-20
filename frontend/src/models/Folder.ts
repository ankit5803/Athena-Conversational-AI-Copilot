import mongoose, { Types, Schema, Document, Model } from "mongoose";
import { IConversation, ConversationSchema } from "./Conversation";
export interface IFolder extends Document {
  name: string;
  userId: string;
  conversations: Types.DocumentArray<IConversation>;
}

export const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true },
    conversations: [{ type: ConversationSchema, required: true }],
  },
  { timestamps: true }
);

export const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>("Folder", FolderSchema);
