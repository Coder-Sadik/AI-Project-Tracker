'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Mail, Lock, User, Zap, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_COLORS } from '@/types';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName.trim(), color);
      toast.success('Account created! Welcome aboard 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('email-already-in-use')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center hero-gradient"
      style={{ padding: '1rem' }}
    >
      <div className="auth-card fade-in" style={{ maxWidth: '28rem' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-xl hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Start tracking projects with AI-powered extraction
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Display name */}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Your name
            </label>
            <div className="relative">
              <User size={16} className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-name"
                type="text"
                className="input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Alice Johnson"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Email address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-email"
                type="email"
                className="input"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="input"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute"
                style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Palette size={14} />
              Your team colour
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  id={`color-${c.slice(1)}`}
                  className="transition-all"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid white' : '3px solid transparent',
                    outline: color === c ? `3px solid ${c}` : 'none',
                    cursor: 'pointer',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                  }}
                  onClick={() => setColor(c)}
                  aria-label={`Select colour ${c}`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              This colour identifies your edits across the app
            </p>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--brand-500)', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
