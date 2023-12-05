import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {
  await connectMongoDB();
  const body = await req.json();
  const email = body.email;
  const exist = await User.exists({ email });
  if (exist) return NextResponse.json({ message: "User already exists" });
  const user = await User.create(body);
  return NextResponse.json({ message: "User created" });
}