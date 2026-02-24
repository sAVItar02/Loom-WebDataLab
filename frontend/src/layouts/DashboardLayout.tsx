import { NavLink, Outlet } from 'react-router';
import { LayoutDashboard, List } from 'lucide-react';
import { cn } from '../utils/helpers';
import SpiderLogo from '../assets/spider.svg?react';

export function DashboardLayout() {
  const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Sessions', href: '/sessions', icon: List },
  ];

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white">
              <SpiderLogo className="h-4 w-4 stroke-white" />
            </div>
            Loom
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
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
        <header className="h-16 border-b border-zinc-800 flex items-center px-8 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-sm font-medium text-zinc-400">Dashboard</h1>
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
