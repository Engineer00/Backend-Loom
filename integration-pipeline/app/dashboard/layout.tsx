import Link from "next/link";

import { SignOutButton } from "@/app/dashboard/_components/sign-out-button";
import { requireUser } from "@/lib/require-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold">
              Integration Pipeline
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-700">
              <Link href="/dashboard/events" className="hover:text-zinc-900">
                Events
              </Link>
              <Link href="/dashboard/jobs" className="hover:text-zinc-900">
                Jobs
              </Link>
              <Link href="/dashboard/processed" className="hover:text-zinc-900">
                Processed
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-zinc-600 sm:block">
              {session.user?.email}
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

