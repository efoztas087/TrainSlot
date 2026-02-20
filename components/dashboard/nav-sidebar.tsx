import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/packages", label: "Packages" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function NavSidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 md:block">
      <nav className="space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
