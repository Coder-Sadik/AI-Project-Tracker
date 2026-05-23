'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/navbar';
import LiveDemoWidget from '@/components/live-demo-widget';
import AnimatedHowItWorks from '@/components/animated-how-it-works';
import {
  Sparkles, Zap, Users, Shield, Activity, Download,
  ChevronRight, ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Sparkles size={22} />,
    title: 'AI Requirement Extraction',
    desc: 'Paste any document or upload PDF/DOCX — AI instantly extracts only the explicitly stated requirements, nothing more.',
    color: '#3b82f6',
  },
  {
    icon: <Users size={22} />,
    title: 'Real-Time Collaboration',
    desc: 'Every edit, completion, and addition syncs instantly across all team members with no page refresh needed.',
    color: '#8b5cf6',
  },
  {
    icon: <Zap size={22} />,
    title: 'Colour-Coded Accountability',
    desc: 'Each team member has a unique colour. Every change is stamped with who did it — full transparency.',
    color: '#f59e0b',
  },
  {
    icon: <Shield size={22} />,
    title: 'Role-Based Access',
    desc: 'Admin controls editing levels: grant full editing or restrict teammates to checkbox-only completion.',
    color: '#22c55e',
  },
  {
    icon: <Activity size={22} />,
    title: 'Activity Log & History',
    desc: 'A live feed of all changes with timestamps. Revert any requirement to a previous version anytime.',
    color: '#ec4899',
  },
  {
    icon: <Download size={22} />,
    title: 'Export Anywhere',
    desc: 'One-click export to PDF, CSV for Excel, or a Markdown checklist for GitHub.',
    color: '#06b6d4',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !loading && user) {
      router.push('/dashboard');
    }
  }, [mounted, loading, user, router]);

  if (mounted && !loading && user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="hero-gradient"
        style={{ padding: '5rem 1.5rem 6rem', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              fontSize: '0.8rem',
              color: '#93c5fd',
              fontWeight: 500,
            }}
          >
            <Sparkles size={13} />
            Powered by Gemini 2.5 Flash
          </div>

          <h1
            className="gradient-text"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
            }}
          >
            Turn Any Document Into a<br />Structured Project Plan
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#94a3b8',
              maxWidth: 580,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            AI Project Tracker extracts requirements from briefs, emails, and docs —
            then your team collaborates in real time with colour-coded accountability.
          </p>

          <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get started free
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/demo" 
              className="btn btn-lg btn-outline" 
            >
              <Sparkles size={16} />
              Try demo
            </Link>
          </div>

          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '1.25rem' }}>
            No credit card required · Firebase + Google Gemini powered
          </p>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Everything your team needs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            From AI extraction to real-time collaboration — all in one tool.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-4"
                style={{
                  width: 48,
                  height: 48,
                  background: `${f.color}18`,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '2rem 1.5rem' }}>
        <LiveDemoWidget />
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '5rem 1.5rem',
          background: 'var(--bg-secondary)',
        }}
      >
        <AnimatedHowItWorks />
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to supercharge your workflow?
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Join teams that use AI to turn documents into action, faster.
          </p>
          <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start for free <ChevronRight size={18} />
            </Link>
            <Link 
              href="/demo" 
              className="btn btn-lg btn-outline" 
            >
              Try without signing up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-default)',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}
      >
        AI Project Tracker · Built with Next.js, Firebase, and Google Gemini
      </footer>
    </div>
  );
}
