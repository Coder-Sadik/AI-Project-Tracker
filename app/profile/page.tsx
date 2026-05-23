'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { updateUserColor } from '@/lib/firestore';
import Navbar from '@/components/navbar';
import { DEFAULT_COLORS } from '@/types';
import toast from 'react-hot-toast';
import { Palette, User, Mail, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile, refreshProfile, loading } = useAuth();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (userProfile) setSelectedColor(userProfile.color);
  }, [userProfile]);

  async function handleSaveColor() {
    if (!user || selectedColor === userProfile?.color) return;
    setSaving(true);
    try {
      await updateUserColor(user.uid, selectedColor);
      await refreshProfile();
      toast.success('Colour updated!');
    } catch {
      toast.error('Failed to update colour');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Profile Settings
        </h1>

        <div className="card" style={{ padding: '1.5rem' }}>
          {/* Name */}
          <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div
              className="flex items-center justify-center rounded-full text-white text-xl font-bold flex-shrink-0"
              style={{ width: 56, height: 56, background: userProfile?.color || '#3b82f6' }}
            >
              {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <User size={14} style={{ color: 'var(--text-muted)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {userProfile?.displayName || 'User'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {userProfile?.email || user?.email || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              <Palette size={16} />
              Your Team Colour
            </label>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              This colour appears next to your edits across all projects, helping teammates identify your changes instantly.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  id={`profile-color-${c.slice(1)}`}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: c,
                    border: selectedColor === c ? '3px solid white' : '3px solid transparent',
                    outline: selectedColor === c ? `3px solid ${c}` : 'none',
                    cursor: 'pointer',
                    transform: selectedColor === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                  aria-label={`Select colour ${c}`}
                />
              ))}
            </div>

            {/* Preview */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div
                className="color-dot"
                style={{ background: selectedColor, width: 12, height: 12 }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {userProfile?.displayName} edited this requirement
              </span>
            </div>

            <button
              id="save-color-btn"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSaveColor}
              disabled={saving || selectedColor === userProfile?.color}
            >
              {saving ? 'Saving…' : 'Save Colour'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
