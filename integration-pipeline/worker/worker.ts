import { prisma } from "../lib/prisma";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffMs(attempt: number) {
  // Exponential-ish backoff capped at 60s
  const base = 1000 * Math.pow(2, Math.min(attempt, 6));
  return Math.min(base, 60_000);
}

async function main() {
  const workerId =
    process.env.WORKER_ID ?? `worker-${process.pid}-${Math.random().toString(16).slice(2)}`;

  console.log(`[worker] started: ${workerId}`);

  while (true) {
    const now = new Date();

    const candidate = await prisma.job.findFirst({
      where: {
        status: "queued",
        runAt: { lte: now },
        lockedAt: null,
      },
      orderBy: { runAt: "asc" },
      include: { webhookEvent: true },
    });

    if (!candidate) {
      await sleep(1000);
      continue;
    }

    const lock = await prisma.job.updateMany({
      where: { id: candidate.id, status: "queued", lockedAt: null },
      data: { lockedAt: now, lockedBy: workerId, status: "running" },
    });

    if (lock.count === 0) continue;

    try {
      if (!candidate.webhookEventId || !candidate.webhookEvent) {
        throw new Error("Job missing webhookEvent");
      }

      // Idempotent output: only create one ProcessedItem per webhook event.
      const already = await prisma.processedItem.findFirst({
        where: { webhookEventId: candidate.webhookEventId },
      });

      if (!already) {
        const eventType = candidate.webhookEvent.type;
        const externalId = candidate.webhookEvent.externalId;

        const summary = `Processed event ${eventType} (${externalId}) at ${new Date().toISOString()}`;

        await prisma.processedItem.create({
          data: {
            webhookEventId: candidate.webhookEventId,
            summary,
          },
        });
      }

      await prisma.job.update({
        where: { id: candidate.id },
        data: {
          status: "succeeded",
          lockedAt: null,
          lockedBy: null,
          lastError: null,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const updated = await prisma.job.update({
        where: { id: candidate.id },
        data: {
          attempts: { increment: 1 },
          lastError: message,
        },
        select: { attempts: true, maxAttempts: true },
      });

      const attempts = updated.attempts;
      const maxAttempts = updated.maxAttempts;

      if (attempts >= maxAttempts) {
        await prisma.job.update({
          where: { id: candidate.id },
          data: { status: "failed", lockedAt: null, lockedBy: null },
        });
      } else {
        const delay = backoffMs(attempts);
        await prisma.job.update({
          where: { id: candidate.id },
          data: {
            status: "queued",
            lockedAt: null,
            lockedBy: null,
            runAt: new Date(Date.now() + delay),
          },
        });
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

