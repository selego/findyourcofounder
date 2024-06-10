import { NextResponse } from "next/server";
import { httpService } from "@/services/httpService";

export async function POST(req) {
  const obj = await req.json();

  const { user, token, ok, code } = await httpService.serverService.post(`/signup`, obj);

  if (code === "PASSWORD_NOT_VALIDATED") return NextResponse.json({ ok: false, message: "Password not validated" });
  if (code === "USER_ALREADY_REGISTERED") return NextResponse.json({ ok: false, message: "User already registered" });
  if (!ok) return NextResponse.json({ ok: false, message: "User not created" });
  return NextResponse.json({ ok: true, message: "User created" });
}