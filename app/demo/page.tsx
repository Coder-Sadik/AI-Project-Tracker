'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';
import { Requirement, Project, UserProfile } from '@/types';
import RequirementRow from '@/components/requirements/requirement-row';
import { Sparkles, Info, UserPlus } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// ── Demo data ──────────────────────────────────────────────────────────────
const DEMO_PROJECT: Project = {
  id: 'demo',
  name: 'E-commerce Platform Redesign',
  createdBy: 'demo-alice',
  teamMembers: ['demo-alice', 'demo-bob', 'demo-charlie'],
  editingLevel: 'full',
  tags: [
    { id: 'tag-1', name: 'Frontend', color: '#3b82f6' },
    { id: 'tag-2', name: 'Backend', color: '#8b5cf6' },
    { id: 'tag-3', name: 'Urgent', color: '#ef4444' },
  ],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

const DEMO_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1', projectId: 'demo', description: 'Implement a responsive shopping cart that persists across sessions using localStorage',
    completed: true, lastEditedBy: 'demo-bob', lastEditorColor: '#4ECDC4', lastEditorName: 'Bob',
    createdBy: 'demo-alice', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    dueDate: null, tags: ['tag-1'], confidence: 0.95, versions: [],
  },
  {
    id: 'req-2', projectId: 'demo', description: 'Design and implement a product search with full-text filtering and category facets',
    completed: false, lastEditedBy: 'demo-alice', lastEditorColor: '#FF6B6B', lastEditorName: 'Alice',
    createdBy: 'demo-alice', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    dueDate: null, tags: ['tag-1', 'tag-2'], confidence: 0.88, versions: [],
  },
  {
    id: 'req-3', projectId: 'demo', description: 'Integrate Stripe payment gateway with support for credit cards, Apple Pay, and Google Pay',
    completed: false, lastEditedBy: 'demo-charlie', lastEditorColor: '#FF8E53', lastEditorName: 'Charlie',
    createdBy: 'demo-alice', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    dueDate: null, tags: ['tag-2', 'tag-3'], confidence: 0.92, versions: [],
  },
  {
    id: 'req-4', projectId: 'demo', description: 'Add user account registration and login with OAuth support (Google, GitHub)',
    completed: true, lastEditedBy: 'demo-alice', lastEditorColor: '#FF6B6B', lastEditorName: 'Alice',
    createdBy: 'demo-bob', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    dueDate: null, tags: ['tag-2'], confidence: 1.0, versions: [],
  },
  {
    id: 'req-5', projectId: 'demo', description: 'Build an admin dashboard with sales analytics, inventory management, and order tracking',
    completed: false, lastEditedBy: 'demo-bob', lastEditorColor: '#4ECDC4', lastEditorName: 'Bob',
    createdBy: 'demo-bob', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    dueDate: null, tags: ['tag-1', 'tag-2'], confidence: 0.72, versions: [],
  },
  {
    id: 'req-6', projectId: 'demo', description: 'Send automated email confirmations for orders, shipping updates, and account actions',
    completed: false, lastEditedBy: 'demo-charlie', lastEditorColor: '#FF8E53', lastEditorName: 'Charlie',
    createdBy: 'demo-charlie', createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    dueDate: null, tags: ['tag-2', 'tag-3'], confidence: 0.45, versions: [],
  },
];

const DEMO_MEMBERS: Record<string, UserProfile> = {
  'demo-alice': { uid: 'demo-alice', displayName: 'Alice', email: 'alice@demo.com', color: '#FF6B6B', createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
  'demo-bob': { uid: 'demo-bob', displayName: 'Bob', email: 'bob@demo.com', color: '#4ECDC4', createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
  'demo-charlie': { uid: 'demo-charlie', displayName: 'Charlie', email: 'charlie@demo.com', color: '#FF8E53', createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
};

export default function DemoPage() {
  const requirements = DEMO_REQUIREMENTS;
  const completedCount = requirements.filter((r) => r.completed).length;
  const progress = (completedCount / requirements.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Demo banner */}
      <div
        className="flex items-center justify-center gap-3 text-sm"
        style={{
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          color: 'white',
          padding: '0.625rem 1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Sparkles size={16} />
        <span>
          <strong>Demo Mode</strong> — Changes aren&apos;t saved. Sign up to create real projects!
        </span>
        <Link
          href="/register"
          className="flex items-center gap-1.5 font-semibold"
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.8rem',
          }}
        >
          <UserPlus size={14} />
          Get started free
        </Link>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Project header */}
        <div className="flex items-center justify-between mb-2" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {DEMO_PROJECT.name}
          </h1>
          <div className="flex gap-2">
            {DEMO_PROJECT.teamMembers.map((uid) => {
              const m = DEMO_MEMBERS[uid];
              return (
                <div
                  key={uid}
                  className="flex items-center justify-center rounded-full text-white font-bold text-xs"
                  style={{ width: 30, height: 30, background: m.color }}
                  title={m.displayName}
                >
                  {m.displayName.charAt(0)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>{completedCount} of {requirements.length} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Info box */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          <Info size={16} style={{ color: 'var(--brand-500)', flexShrink: 0, marginTop: 2 }} />
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>This is a live demo.</strong> Try ticking checkboxes, clicking edit (pencil icon), or exploring the confidence indicators (⚠️ = AI was less certain about that requirement).
            The colour dots show which team member last edited each item.
          </div>
        </div>

        {/* Requirements */}
        <div className="flex flex-col gap-1">
          {requirements.map((req, i) => (
            <RequirementRow
              key={req.id}
              req={req}
              project={DEMO_PROJECT}
              currentUser={DEMO_MEMBERS['demo-alice']}
              memberProfiles={DEMO_MEMBERS}
              canEdit
              canCheckbox
              isAdmin
              index={i}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          className="card text-center mt-8"
          style={{ padding: '2rem' }}
        >
          <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Ready to extract your own requirements?
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Sign up free and paste any document — AI will extract structured requirements in seconds.
          </p>
          <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              <UserPlus size={16} />
              Create free account
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
