import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/stock", label: "Stock" },
  { href: "/users", label: "Users" }
];

export async function AdminShell({
  title,
  description,
  currentPath,
  children
}: {
  title: string;
  description?: string;
  currentPath: string;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div>
          <p className="muted" style={{ color: "#94a3b8", margin: 0 }}>
            Operations Console
          </p>
          <strong style={{ display: "block", marginTop: 6, fontSize: "1.15rem" }}>
            Eco Bright Admin
          </strong>
          <p className="muted" style={{ color: "#cbd5e1", marginBottom: 0 }}>
            {user?.name} · {user?.role}
          </p>
        </div>

        <nav>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={currentPath.startsWith(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content">
        <div className="topbar">
          <div>
            <h1 className="page-title">{title}</h1>
            {description ? <p className="page-subtitle">{description}</p> : null}
          </div>
          <LogoutButton />
        </div>
        {children}
      </main>
    </div>
  );
}
