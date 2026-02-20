"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/server/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    setLoading(false);
    setMessage(error ? error.message : "Magic link sent. Check your inbox.");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form onSubmit={onSubmit} className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Coach login</h1>
        <p className="mb-4 text-sm text-slate-600">Sign in with a magic link.</p>

        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="coach@example.com"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send magic link"}
        </Button>

        {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
      </form>
    </main>
  );
}
