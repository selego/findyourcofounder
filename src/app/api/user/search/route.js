import { NextResponse } from "next/server";
import accountingApi from "../../accounting_api";

export async function POST() {
  const { data, ok } = await accountingApi.post(`/search`)

  if (!ok) return NextResponse.json({ messsage: "Error fetching users", users: [] });
  return NextResponse.json({ users: data.users });
}

export const dynamic = "force-dynamic";
