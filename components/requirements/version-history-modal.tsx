'use client';

import { Requirement } from '@/types';
import { revertRequirementVersion, addActivity } from '@/lib/firestore';
import { format } from 'date-fns';
import { X, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  req: Requirement;
  onClose: () => void;
  currentUser: { uid: string; displayName: string; color: string };
  projectId: string;
  canEdit: boolean;
}

export default function VersionHistoryModal({ req, onClose, currentUser, projectId, canEdit }: Props) {
  async function handleRevert(index: number) {
    if (!canEdit) return;
    if (!confirm('Revert to this version?')) return;
    try {
      await revertRequirementVersion(req, index, currentUser.uid, currentUser.displayName, currentUser.color);
      await addActivity(
        projectId,
        'reverted_version',
        currentUser.uid,
        currentUser.displayName,
        currentUser.color,
        `to version from ${format(req.versions[index].editedAt?.toDate?.() || new Date(), 'MMM d')}`,
        req.id
      );
      toast.success('Reverted to previous version');
      onClose();
    } catch {
      toast.error('Failed to revert');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Version History
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current version */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--brand-500)' }}>
              Current
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              by {req.lastEditorName}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{req.description}</p>
        </div>

        {/* Previous versions */}
        {req.versions.length === 0 ? (
          <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            No previous versions
          </p>
        ) : (
          <div className="flex flex-col gap-3" style={{ maxHeight: 360, overflowY: 'auto' }}>
            {[...req.versions].reverse().map((v, i) => {
              const originalIndex = req.versions.length - 1 - i;
              const dateStr = v.editedAt?.toDate
                ? format(v.editedAt.toDate(), 'MMM d, yyyy · HH:mm')
                : 'Unknown date';

              return (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="color-dot"
                        style={{ background: v.editorColor || '#94a3b8' }}
                      />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {v.editorName}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {dateStr}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRevert(originalIndex)}
                        title="Revert to this version"
                      >
                        <RotateCcw size={12} /> Revert
                      </button>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
