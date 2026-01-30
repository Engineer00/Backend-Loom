import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">
          Integration Pipeline
        </h1>
        <p className="mt-3 text-zinc-700">
          A small system designed to showcase: auth, Postgres schema, signed
          webhooks, async jobs with retries, and a dashboard (Next.js + Node).
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
