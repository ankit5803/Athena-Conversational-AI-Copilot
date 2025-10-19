import { connectToDatabase } from "@/utils/database";
import { User } from "@/models/User";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const saveUser = async () => {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return;
  const user = await currentUser();
  if (!user) return;
  let email = user?.emailAddresses[0].emailAddress || "";
  let mongouser = await User.findOne({ email });
  if (!mongouser) {
    mongouser = await User.create({
      clerkId: user?.id || "",
      email,
      name: user?.fullName || "",
      avatar: user?.imageUrl || "",
    });
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await saveUser();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ status: "error" });
  }
}
