import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/database";
import { Conversation } from "@/models/Conversation";

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
  const chats = await Conversation.find({
    userId: id,
  });
  return NextResponse.json(chats);
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { pinned } = await request.json();
    await Conversation.findByIdAndUpdate(id, { pinned });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
