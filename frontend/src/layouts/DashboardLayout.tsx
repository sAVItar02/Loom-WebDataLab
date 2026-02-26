import { NavLink, Outlet } from "react-router";
import { LayoutDashboard, List } from "lucide-react";
import { cn } from "../utils/helpers";
import SpiderLogo from "../assets/spider.svg?react";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function DashboardLayout() {
  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Sessions", href: "/sessions", icon: List },
  ];

  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className={`${theme === "dark" ? "dark" : ""} flex min-h-screen w-full bg-bg-primary text-text-primary font-sans selection:bg-primary/30`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-default bg-bg-secondary flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-border-default justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-text-on-primary">
              <SpiderLogo className="h-4 w-4 stroke-current" />
            </div>
            Loom
          </div>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border-default flex items-center px-8 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-sm font-medium text-text-secondary">Dashboard</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
