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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { newName } = await request.json();
    await Folder.findByIdAndUpdate(id, { name: newName });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error renaming folder:", error);
    return NextResponse.json(
      { error: "Failed to rename folder" },
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
    await Folder.findByIdAndDelete(id);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
