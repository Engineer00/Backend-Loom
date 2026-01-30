import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function JobsPage() {
  await requireUser();

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { webhookEvent: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Background processing with retries/backoff and locking.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Attempts</th>
              <th className="px-4 py-3 font-medium">Run at</th>
              <th className="px-4 py-3 font-medium">Event</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-600" colSpan={6}>
                  No jobs yet. Send a webhook event to enqueue one.
                </td>
              </tr>
            ) : (
              jobs.map((j) => (
                <tr key={j.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    {j.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-3">{j.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        j.status === "succeeded"
                          ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                          : j.status === "failed"
                            ? "rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                            : j.status === "running"
                              ? "rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                              : "rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
                      }
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {j.attempts}/{j.maxAttempts}
                  </td>
                  <td className="px-4 py-3">
                    {j.runAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {j.webhookEvent?.externalId ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

