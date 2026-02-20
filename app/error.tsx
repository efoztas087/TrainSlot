"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <button className="mt-4 rounded bg-slate-900 px-3 py-2 text-white" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
