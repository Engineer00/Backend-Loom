import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function ProcessedPage() {
  await requireUser();

  const items = await prisma.processedItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { webhookEvent: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Processed outputs</h1>
        <p className="mt-1 text-sm text-zinc-600">
          What the worker produced from webhook events.
        </p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No processed items yet. Start the worker and send a webhook.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{it.webhookEvent.type}</div>
                <div className="font-mono text-xs text-zinc-600">
                  {it.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </div>
              </div>
              <div className="mt-2 text-sm text-zinc-700">{it.summary}</div>
              <div className="mt-2 font-mono text-xs text-zinc-500">
                event: {it.webhookEvent.provider}/{it.webhookEvent.externalId}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

