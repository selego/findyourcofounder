import { NextResponse } from "next/server";
import { httpService } from "@/services/httpService";

export async function POST(req) {
  const body = await req.json();

  const { data, ok } = await httpService.serverService.put(`/${body._id}`, body)
  if (!ok) return NextResponse.json({ ok: false, message: "Error updating user" });
  return NextResponse.json({ message: "User updated" });
}
