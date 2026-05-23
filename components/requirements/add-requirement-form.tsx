'use client';

import { useState } from 'react';

import { createRequirement, addActivity } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

interface Props {
  projectId: string;
  currentUser: { uid: string; displayName: string; color: string };
  onAdded?: () => void;
}

export default function AddRequirementForm({ projectId, currentUser, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!desc.trim()) return;
    setSaving(true);
    try {
      const reqId = await createRequirement(
        projectId,
        desc.trim(),
        currentUser.uid,
        currentUser.displayName,
        currentUser.color
      );
      await addActivity(
        projectId,
        'created_requirement',
        currentUser.uid,
        currentUser.displayName,
        currentUser.color,
        `"${desc.slice(0, 60)}"`,
        reqId
      );
      toast.success('Requirement added');
      setDesc('');
      setOpen(false);
      onAdded?.();
    } catch {
      toast.error('Failed to add requirement');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        id="add-req-btn"
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Add Requirement
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-4 mt-2 fade-in"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
    >
      <textarea
        id="new-req-textarea"
        className="input text-sm mb-3"
        style={{ minHeight: 80 }}
        placeholder="Describe the requirement…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
          if (e.key === 'Escape') { setOpen(false); setDesc(''); }
        }}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          id="save-new-req-btn"
          className="btn btn-primary btn-sm"
          onClick={handleAdd}
          disabled={!desc.trim() || saving}
        >
          {saving ? 'Adding…' : 'Add Requirement'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setOpen(false); setDesc(''); }}
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}
