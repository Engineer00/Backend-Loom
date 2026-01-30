import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function DashboardHome() {
  await requireUser();

  const [eventCount, jobCount, failedJobs] = await Promise.all([
    prisma.webhookEvent.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: "failed" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Signed webhooks → DB → async jobs (retries/idempotency) → dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">Webhook events</div>
          <div className="mt-1 text-2xl font-semibold">{eventCount}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">Jobs</div>
          <div className="mt-1 text-2xl font-semibold">{jobCount}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm text-zinc-600">Failed jobs</div>
          <div className="mt-1 text-2xl font-semibold">{failedJobs}</div>
        </div>
      </div>
    </div>
  );
}

