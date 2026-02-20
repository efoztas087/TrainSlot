import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/packages", label: "Packages" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function NavMobile() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white p-2 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded px-2 py-2 text-center text-xs hover:bg-slate-100">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
