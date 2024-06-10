import { NextResponse } from "next/server";
import { httpService } from "@/services/httpService";

export async function POST() {
  const { data, ok } = await httpService.serverService.post(`/search`)

  if (!ok) return NextResponse.json({ messsage: "Error fetching users", users: [] });
  return NextResponse.json({ users: data.users });
}


export async function GET() {
  const { data, ok } = await httpService.serverService.post(`/search`);

  if (!ok) return NextResponse.json({ messsage: "Error fetching users", users: [] });
  return NextResponse.json({ users: data.users });
}

export const dynamic = "force-dynamic";
