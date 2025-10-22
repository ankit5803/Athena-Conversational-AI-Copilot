import { NextRequest, NextResponse } from "next/server";
import { Conversation } from "@/models/Conversation";
import { connectToDatabase } from "@/utils/database";

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const { title, userId } = await request.json();
  const chat = await Conversation.create({ title, userId });
  return NextResponse.json(chat);
}
