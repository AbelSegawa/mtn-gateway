const BASE = process.env.MTN_BASE || "https://sandbox.momodeveloper.mtn.com";

export function normalizePhone(raw: string): string {
  let p = String(raw).replace(/\s+/g, "").replace(/^\+/, "");
  if (p.startsWith("0")) p = "256" + p.slice(1);
  if (!p.startsWith("256")) p = "256" + p;
  return p;
}

export async function mtnToken(): Promise<string> {
  const user = process.env.MTN_API_USER!;
  const key = process.env.MTN_API_KEY!;
  const sub = process.env.MTN_SUBSCRIPTION_KEY!;
  const basic = Buffer.from(`\( {user}: \){key}`).toString("base64");
  const res = await fetch(`${BASE}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": sub,
    },
  });
  if (!res.ok) throw new Error("Token failed: " + (await res.text()));
  const data = await res.json();
  return data.access_token;
}

export async function requestToPay(params: {
  amount: string;
  currency: string;
  externalId: string;
  phone: string;
  referenceId: string;
}) {
  const token = await mtnToken();
  const env = process.env.MTN_TARGET_ENV || "sandbox";
  const sub = process.env.MTN_SUBSCRIPTION_KEY!;
  return fetch(`${BASE}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": params.referenceId,
      "X-Target-Environment": env,
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": sub,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      externalId: params.externalId,
      payer: { partyIdType: "MSISDN", partyId: params.phone },
      payerMessage: "Payment",
      payeeNote: params.externalId,
    }),
  });
}