import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/types/user";
import { query } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await query('SELECT id, email, name, created_at as "createdAt" FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data: result.rows[0] as User });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, name } = body;
    const result = await query(
      'UPDATE users SET email = COALESCE($1, email), name = COALESCE($2, name) WHERE id = $3 RETURNING id, email, name, created_at as "createdAt"',
      [email, name, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
