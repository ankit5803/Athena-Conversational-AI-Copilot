import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/database";
import { Conversation } from "@/models/Conversation";
import { Folder } from "@/models/Folder";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;
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
    await Folder.updateMany(
      { "conversations._id": id },
      { $set: { "conversations.$.pinned": pinned } }
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Conversation.findByIdAndDelete(id);
    await Folder.updateMany(
      { "conversations._id": id },
      { $pull: { conversations: { _id: id } } }
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
