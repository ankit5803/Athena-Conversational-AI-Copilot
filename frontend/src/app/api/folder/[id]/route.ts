import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/database";
import { Folder } from "@/models/Folder";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;
  //   const { isAuthenticated } = await auth();
  //   if (!isAuthenticated) return;
  //   const user = await currentUser();
  // const chats = await Conversation.find({ userId });
  const folders = await Folder.find({
    userId: id,
  });
  return NextResponse.json(folders);
}
