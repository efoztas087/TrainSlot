"use client";

export default function GlobalError() {
  return (
    <html>
      <body>
        <main className="mx-auto max-w-lg p-6">
          <h2 className="text-xl font-semibold">Unexpected application error</h2>
          <p className="mt-2 text-sm text-slate-600">Please refresh the page.</p>
        </main>
      </body>
    </html>
  );
}
