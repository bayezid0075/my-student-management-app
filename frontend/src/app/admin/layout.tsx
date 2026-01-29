'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/courses', label: 'Courses', icon: '📚' },
    { href: '/admin/batches', label: 'Batches', icon: '👥' },
    { href: '/admin/students', label: 'Students', icon: '🎓' },
    { href: '/admin/invoices', label: 'Invoices', icon: '🧾' },
    { href: '/admin/certificates', label: 'Certificates', icon: '🏆' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-cream via-white to-retro-blue-light/10">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-retro-xl border-r-4 border-retro-pink z-10">
        <div className="p-6 border-b-4 border-white bg-gradient-to-br from-retro-pink via-retro-lavender to-retro-blue">
          <h1 className="text-3xl font-bold text-white retro-font drop-shadow-lg">Admin Panel</h1>
          <p className="text-sm text-white/90 mt-2 font-semibold">Welcome, {user?.username}</p>
        </div>

        <nav className="p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-retro transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-retro-lavender to-retro-lavender-light text-white shadow-retro-lg scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-retro'
              }`}
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-gray-100">
          <button
            onClick={logout}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-retro hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold shadow-retro hover:shadow-retro-lg"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
