'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { Sun, Moon, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <nav className="nav" style={{ justifyContent: 'space-between' }}>
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-lg"
        style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
      >
        <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-md" />
        <span className="gradient-text hide-mobile">AI Project Tracker</span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <button
            id="theme-toggle"
            className="btn btn-ghost btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {user && (
          <>
            <Link href="/dashboard" className="btn btn-ghost btn-sm hide-mobile">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                id="user-menu-btn"
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-all"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <div
                  className="flex items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{
                    width: 32,
                    height: 32,
                    background: userProfile?.color || '#3b82f6',
                    flexShrink: 0,
                  }}
                >
                  {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
                <span
                  className="hide-mobile text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {userProfile?.displayName || 'User'}
                </span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-xl shadow-lg py-1 z-50"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    minWidth: 180,
                  }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                    style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={15} />
                    Profile & Color
                  </Link>
                  <div className="divider" style={{ margin: '0.25rem 0' }} />
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-[var(--bg-secondary)] transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!user && (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
