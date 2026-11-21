"use client";

import { useEffect } from "react";
import { Snowflake } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="glass max-w-lg rounded-2xl p-10">
        <Snowflake className="mx-auto mb-4 size-8 text-gold" />
        <h1 className="font-display text-2xl text-champagne">A little snowstorm interrupted us</h1>
        <p className="mt-3 text-sm text-muted">Something went wrong while loading this page. Please try again.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-[#081426]">Try again</button>
      </div>
    </main>
  );
}
