import { NextRequest, NextResponse } from "next/server";
import { Conversation } from "@/models/Conversation";
import { connectToDatabase } from "@/utils/database";
// export async function GET(request: NextRequest) {
//   await connectToDatabase();
//   //   const { isAuthenticated } = await auth();
//   //   if (!isAuthenticated) return;
//   //   const user = await currentUser();
//   const chats = await Conversation.find({ userId });
//   return NextResponse.json(chats);
// }

export async function POST(request: NextRequest) {
  await connectToDatabase();
  //   const { isAuthenticated } = await auth();
  //   if (!isAuthenticated) return;
  //   const user = await currentUser();
  const { title, userId } = await request.json();
  const chat = await Conversation.create({ title, userId });
  return NextResponse.json(chat);
}
