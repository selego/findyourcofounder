import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import accountingApi from "../../accounting_api";

export async function GET() {
  const session = await getServerSession(authOptions);

  const { data, ok } = await accountingApi.get(`/${session.user?._id}`)

  if (!ok) return NextResponse.json({ ok: false, message: "User not found" });
  return NextResponse.json({ ok: true, user: data });
}

export const dynamic = "force-dynamic";
