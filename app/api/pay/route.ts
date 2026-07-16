import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { normalizePhone, requestToPay } from "@/lib/mtn";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone);
    const amount = String(body.amount);
    const externalId = String(body.order_id || `ord-${Date.now()}`);
    const currency = String(body.currency || "EUR");
    const referenceId = randomUUID();

    const rtp = await requestToPay({
      amount,
      currency,
      externalId,
      phone,
      referenceId,
    });

    if (rtp.status !== 202 && !rtp.ok) {
      return NextResponse.json(
        { error: await rtp.text() },
        { status: 502 }
      );
    }

    const sql = getDb();
    await sql`
      INSERT INTO payments (external_id, phone, amount, currency, reference_id, status)
      VALUES (${externalId}, ${phone}, ${Number(amount)}, ${currency}, ${referenceId}::uuid, 'pending')
    `;

    return NextResponse.json({
      ok: true,
      message: "Check your phone to approve MTN MoMo",
      external_id: externalId,
      reference_id: referenceId,
      status: "pending",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}