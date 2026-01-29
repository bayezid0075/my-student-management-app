'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/student', label: 'Dashboard', icon: '📊' },
    { href: '/student/courses', label: 'My Courses', icon: '📚' },
    { href: '/student/invoices', label: 'Invoices', icon: '🧾' },
    { href: '/student/certificates', label: 'Certificates', icon: '🏆' },
  ];

  const isActive = (href: string) => {
    if (href === '/student') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-cream via-white to-retro-mint-light/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-retro-mint via-retro-mint-light to-retro-blue-light shadow-retro-xl border-b-4 border-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white retro-font drop-shadow-lg">Student Portal</h1>
            <p className="text-sm text-white/90 font-semibold mt-1">Welcome, {user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-3 bg-white text-retro-mint rounded-retro hover:bg-gray-100 transition-all duration-200 font-bold shadow-retro-lg hover:shadow-retro-xl"
          >
            Logout 🚪
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-retro-lg border-b-4 border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-4 whitespace-nowrap transition-all duration-200 ${
                  isActive(item.href)
                    ? 'border-b-4 border-retro-mint text-retro-mint font-bold bg-retro-mint/5'
                    : 'text-gray-600 hover:text-retro-mint hover:bg-gray-50 font-semibold'
                }`}
              >
                <span className="text-xl mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
