import { AppLogo } from "@/components/shared/app-logo";
import { NavMobile } from "@/components/dashboard/nav-mobile";
import { NavSidebar } from "@/components/dashboard/nav-sidebar";
import { requireCoach } from "@/server/auth/guard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireCoach();

  return (
    <div className="min-h-screen md:flex">
      <NavSidebar />
      <div className="flex-1 pb-16 md:pb-0">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
            <AppLogo />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl p-4">{children}</main>
      </div>
      <NavMobile />
    </div>
  );
}
