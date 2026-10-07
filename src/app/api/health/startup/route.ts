import { NextResponse } from "next/server";

const startedAt = new Date().toISOString();

export async function GET() {
  return NextResponse.json({ status: "started", startedAt, timestamp: new Date().toISOString() });
}
