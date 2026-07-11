import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions";

const links = [
  { href: "/community", label: "Community" },
  { href: "/store", label: "Store" },
  { href: "/cards/register", label: "Register a Card" },
  { href: "/subscription", label: "Juice Club" },
];

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-card-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="font-bold text-lg tracking-tight text-brand-dark dark:text-brand-light">
          OpenLA<span className="text-brand">Store</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm flex-wrap">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand transition-colors">
              {l.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link href="/admin/export" className="hover:text-brand transition-colors">
              Export
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className="hover:text-brand transition-colors font-medium">
                {user.name}
              </Link>
              <form action={logout}>
                <button className="text-xs opacity-70 hover:opacity-100 underline" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-brand text-white px-3 py-1.5 rounded-md hover:bg-brand-dark transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
