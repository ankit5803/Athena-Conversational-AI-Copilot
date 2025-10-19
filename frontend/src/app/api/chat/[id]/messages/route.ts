import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/database";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import axios from "axios";

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
  // let { content, role } = await request.json();
  // const backendurl = process.env.BACKEND_URL || "http://localhost:8000";
  // const { id } = await params;
  // let message, chat;
  // if (role === "assistant") {
  //   content = await axios
  //     .post(`${backendurl}/search`, { query: content })
  //     .then((res: any) => {
  //       return res.data.response;
  //     })
  //     .catch((err) => console.log(err));

  //   message = await Message.create({
  //     content: content.trim(),
  //     role,
  //   });
  //   chat = await Conversation.findOneAndUpdate(
  //     { _id: id },
  //     { $inc: { messageCount: 1 }, $push: { messages: message } },
  //     { new: true }
  //   );
  //   return NextResponse.json(chat, {
  //     headers: { "Content-Type": "text/event-stream" },
  //   });
  // } else {
  //   message = await Message.create({
  //     content: content.trim(),
  //     role,
  //   });
  //   chat = await Conversation.findOneAndUpdate(
  //     { _id: id },
  //     { $inc: { messageCount: 1 }, $push: { messages: message } },
  //     { new: true }
  //   );
  //   return NextResponse.json(chat, {
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }
}
