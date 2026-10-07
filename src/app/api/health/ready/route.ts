import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await pool.query("SELECT 1");
    checks.database = "up";
  } catch {
    checks.database = "down";
    healthy = false;
  }

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  );
}
