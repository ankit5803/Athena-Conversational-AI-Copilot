import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/database";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;
  const { content, role } = await request.json();
  const message = await Message.create({
    content: content.trim(),
    role,
  });
  const chat = await Conversation.findOneAndUpdate(
    { _id: id },
    { $inc: { messageCount: 1 }, $push: { messages: message } },
    { new: true }
  );
  return NextResponse.json(chat, {
    headers: { "Content-Type": "application/json" },
  });
}
