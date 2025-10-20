import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/database";
import { Folder } from "@/models/Folder";

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const { name, conversations, userId } = await request.json();
  //   const { isAuthenticated } = await auth();
  //   if (!isAuthenticated) return;
  //   const user = await currentUser();
  // const chats = await Conversation.find({ userId });
  const folder = await Folder.create({ name, conversations, userId });
  return NextResponse.json(folder);
}
