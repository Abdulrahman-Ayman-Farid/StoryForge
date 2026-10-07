import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/types/user";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const result = await query(
      'SELECT id, email, name, created_at as "createdAt" FROM users ORDER BY created_at DESC'
    );
    return NextResponse.json({ data: result.rows as User[] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;
    if (!email || !name) {
      return NextResponse.json({ error: "email and name are required" }, { status: 400 });
    }
    const id = randomUUID();
    const result = await query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at as "createdAt"',
      [id, email, name]
    );
    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
