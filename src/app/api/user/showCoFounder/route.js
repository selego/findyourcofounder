import { NextResponse } from "next/server";
import { httpService } from "@/services/httpService";

export async function POST(req) {
  const { id, clicks } = await req.json();
  const { data, ok } = await httpService.serverService.put(`/${id}`, { clicks })

  if (!ok) return NextResponse.json({ ok: false, message: "Error updating user" });
  return NextResponse.json({ ok: true, data, message: "clicked" });
}