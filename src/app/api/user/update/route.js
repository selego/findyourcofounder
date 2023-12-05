import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {
  await connectMongoDB();
  const body = await req.json();
  const user = await User.findOne({ _id: body._id });
  if (!user) return NextResponse.json({ message: "User not found" });
  const { __v, _id, ...data } = body;
  user.set(data);
  await user.save();

  return NextResponse.json({ message: "User updated" });
}
