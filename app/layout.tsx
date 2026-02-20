import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TrainSlot",
  description: "Lean booking & credits SaaS for personal trainers"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
