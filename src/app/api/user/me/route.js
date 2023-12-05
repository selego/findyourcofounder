import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  const session = await getServerSession(authOptions);

  await connectMongoDB();
  const user = await User.findOne({ _id: session.user._id });
  return NextResponse.json({ user });
}

export const dynamic = "force-dynamic";
