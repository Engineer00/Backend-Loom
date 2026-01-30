import { Suspense } from "react";

import LoginForm from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
          <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 text-sm text-zinc-600">
            Loading…
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

