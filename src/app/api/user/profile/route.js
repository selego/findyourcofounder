import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { httpService } from "@/services/httpService";

export async function GET() {
  const session = await getServerSession(authOptions);

  const { data, ok } = await httpService.serverService.get(`/${session.user?._id}`);
  console.log({ data, ok });

  if (!ok) return NextResponse.json({ ok, message: "User not found" });
  return NextResponse.json({ ok, user: data });
}

export const dynamic = "force-dynamic";
