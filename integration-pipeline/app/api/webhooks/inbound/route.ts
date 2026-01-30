import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  data: z.unknown().optional(),
});

function timingSafeEqualHex(a: string, b: string) {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const secret = process.env.WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Missing WEBHOOK_SIGNING_SECRET" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("x-webhook-signature") ?? "";
  const provider = req.headers.get("x-webhook-provider") ?? "inbound";

  const rawBody = await req.text();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const signatureValid =
    signature.length === expected.length && timingSafeEqualHex(signature, expected);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const externalId = parsed.data.id;
  const type = parsed.data.type ?? "unknown";

  // Idempotency: provider+externalId is unique.
  const event = await prisma.webhookEvent.upsert({
    where: { provider_externalId: { provider, externalId } },
    create: {
      provider,
      externalId,
      type,
      signatureValid,
      payload: payload as Prisma.InputJsonValue,
    },
    update: {
      // Keep the first received payload; but record signature validity.
      signatureValid,
    },
  });

  // Only enqueue if signature is valid.
  if (!signatureValid) {
    return NextResponse.json(
      { ok: false, eventId: event.id, error: "Invalid signature" },
      { status: 401 },
    );
  }

  // Create a job to process this event. Multiple webhooks for the same event will
  // still only create one event row, but may create multiple jobs; keep it simple
  // and let the worker handle idempotency at output stage.
  const job = await prisma.job.create({
    data: {
      type: "process_webhook_event",
      status: "queued",
      webhookEventId: event.id,
      runAt: new Date(),
      maxAttempts: 5,
    },
  });

  return NextResponse.json({ ok: true, eventId: event.id, jobId: job.id });
}

