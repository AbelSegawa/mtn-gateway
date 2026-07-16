"use client";

import { useState } from "react";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("100");
  const [out, setOut] = useState("");

  async function pay() {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        amount,
        order_id: "web-" + Date.now(),
        currency: "EUR",
      }),
    });
    setOut(await res.text());
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>MTN MoMo (sandbox)</h1>
      <p>Phone: <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0772123456" /></p>
      <p>Amount: <input value={amount} onChange={(e) => setAmount(e.target.value)} /></p>
      <button onClick={pay}>Pay</button>
      <pre>{out}</pre>
    </main>
  );
}