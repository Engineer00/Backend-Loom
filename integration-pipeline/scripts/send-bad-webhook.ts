import "dotenv/config";

async function main() {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const payload = {
    id: `evt_${Date.now()}`,
    type: "order.created",
    data: { note: "this should fail signature validation" },
  };

  const res = await fetch(`${baseUrl}/api/webhooks/inbound`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-provider": "inbound",
      "x-webhook-signature": "deadbeef",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`[bad-webhook] status=${res.status} body=${text}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

