import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function EventsPage() {
  await requireUser();

  const events = await prisma.webhookEvent.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Webhook events</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ingested via a signed webhook endpoint with idempotency on{" "}
          <code className="rounded bg-zinc-100 px-1">provider+externalId</code>.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">External ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Signature</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-600" colSpan={5}>
                  No events yet. Send one using <code>npm run demo:webhook</code>.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    {e.receivedAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-4 py-3">{e.provider}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.externalId}</td>
                  <td className="px-4 py-3">{e.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        e.signatureValid
                          ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {e.signatureValid ? "valid" : "invalid"}
                    </span>
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

