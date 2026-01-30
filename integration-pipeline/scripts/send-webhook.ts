import "dotenv/config";
import crypto from "crypto";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function main() {
  const secret = mustEnv("WEBHOOK_SIGNING_SECRET");
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  const payload = {
    id: `evt_${Date.now()}`,
    type: "order.created",
    data: {
      orderId: `ord_${Math.random().toString(16).slice(2)}`,
      amount: 1999,
      currency: "USD",
    },
  };

  const raw = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");

  const res = await fetch(`${baseUrl}/api/webhooks/inbound`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-provider": "inbound",
      "x-webhook-signature": signature,
    },
    body: raw,
  });

  const text = await res.text();
  console.log(`[webhook] status=${res.status} body=${text}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

