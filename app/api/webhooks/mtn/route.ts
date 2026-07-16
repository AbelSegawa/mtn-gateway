import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ref =
    body.referenceId ||
    req.headers.get("x-reference-id") ||
    body.externalId;
  const raw = String(body.status || "").toUpperCase();
  let status = "pending";
  if (raw === "SUCCESSFUL") status = "successful";
  else if (raw === "FAILED") status = "failed";

  if (ref) {
    const sql = getDb();
    await sql`
      UPDATE payments SET status = ${status}
      WHERE reference_id = ${ref}::uuid
    `;
  }
  return NextResponse.json({ received: true });
}