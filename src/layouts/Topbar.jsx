import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Menu, Bell, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications', { read: false, limit: 1 }),
    refetchInterval: 60_000,
  });

  const count = data?.total_unread || data?.count || 0;

  return (
    <Link href="/notifications">
      <a className="relative p-2 rounded-lg text-text-secondary hover:bg-surface-100 hover:text-text-primary">
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </a>
    </Link>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100 text-text-secondary"
      >
        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <span className="hidden sm:block text-sm font-medium text-text-primary truncate max-w-[120px]">
          {user?.email}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-surface-200 rounded-lg shadow-modal z-20 py-1">
            <div className="px-3 py-2 border-b border-surface-200">
              <p className="text-xs text-text-muted">Signed in as</p>
              <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
              <p className="text-xs text-brand-600 font-medium mt-0.5">{user?.role}</p>
            </div>
            <button
              onClick={() => { setOpen(false); navigate('/profile'); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-100"
            >
              <User className="w-4 h-4" /> My Profile
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/profile/security'); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-100"
            >
              <Settings className="w-4 h-4" /> Security
            </button>
            <div className="border-t border-surface-200 mt-1" />
            <button
              onClick={() => { setOpen(false); logout(); navigate('/login'); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Topbar({ onMenuClick }) {
  const [location] = useLocation();

  const segments = location.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    href: '/' + segments.slice(0, i + 1).join('/'),
    current: i === segments.length - 1,
  }));

  return (
    <header className="h-14 md:h-16 bg-white border-b border-surface-200 flex items-center px-4 gap-3 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex-1 min-w-0 hidden sm:block">
        <ol className="flex items-center gap-1 text-sm text-text-muted">
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <span className="text-surface-200">/</span>}
              {crumb.current ? (
                <span className="font-medium text-text-primary truncate" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href}>
                  <a className="hover:text-text-primary truncate">{crumb.label}</a>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}
