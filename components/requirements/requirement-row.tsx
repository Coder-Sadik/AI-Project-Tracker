'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Requirement, Project, UserProfile, Tag } from '@/types';
import {
  updateRequirementDescription,
  updateRequirement,
  deleteRequirement,
  addActivity,
} from '@/lib/firestore';
import { format, isPast } from 'date-fns';
import {
  Trash2,
  Edit3,
  Check,
  X,
  History,
  Calendar,
  Tag as TagIcon,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  req: Requirement;
  project: Project;
  currentUser: { uid: string; displayName: string; color: string };
  memberProfiles: Record<string, UserProfile>;
  canEdit: boolean;
  canCheckbox: boolean;
  isAdmin: boolean;
  onHistoryOpen?: (req: Requirement) => void;
  index: number;
}

function ConfidenceDot({ value }: { value: number | null }) {
  if (value === null) return null;
  if (value >= 0.8) return null; // High confidence, no indicator
  const color = value >= 0.5 ? '#f59e0b' : '#ef4444';
  return (
    <span
      title={`AI confidence: ${Math.round((value ?? 0) * 100)}%`}
      style={{ cursor: 'help', color, flexShrink: 0 }}
    >
      <AlertTriangle size={12} />
    </span>
  );
}

export default React.memo(function RequirementRow({
  req,
  project,
  currentUser,
  memberProfiles,
  canEdit,
  canCheckbox,
  isAdmin,
  onHistoryOpen,
  index,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(req.description);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditValue(req.description);
  }, [req.description]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const isOverdue =
    req.dueDate &&
    !req.completed &&
    isPast(req.dueDate.toDate());

  const lastEditor = req.lastEditedBy ? memberProfiles[req.lastEditedBy] : null;
  const dueDateStr = req.dueDate
    ? format(req.dueDate.toDate(), 'MMM d')
    : null;

  async function handleToggle() {
    if (!canCheckbox) return;
    setSaving(true);
    try {
      await updateRequirement(
        req.id,
        { completed: !req.completed },
        currentUser.uid,
        currentUser.displayName,
        currentUser.color
      );
      await addActivity(
        project.id,
        req.completed ? 'uncompleted' : 'completed',
        currentUser.uid,
        currentUser.displayName,
        currentUser.color,
        req.description.slice(0, 80),
        req.id
      );
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    if (!canEdit) return;
    if (editValue.trim() === req.description) {
      setEditing(false);
      return;
    }
    if (!editValue.trim()) {
      toast.error('Description cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateRequirementDescription(
        req,
        editValue.trim(),
        currentUser.uid,
        currentUser.displayName,
        currentUser.color
      );
      await addActivity(
        project.id,
        'edited_description',
        currentUser.uid,
        currentUser.displayName,
        currentUser.color,
        `"${editValue.trim().slice(0, 60)}"`,
        req.id
      );
      setEditing(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!canEdit && !isAdmin) return;
    if (!confirm('Delete this requirement?')) return;
    setDeleting(true);
    try {
      await addActivity(
        project.id,
        'deleted',
        currentUser.uid,
        currentUser.displayName,
        currentUser.color,
        `"${req.description.slice(0, 60)}"`,
        req.id
      );
      await deleteRequirement(req.id);
      toast.success('Requirement deleted');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  }

  async function toggleTag(tag: Tag) {
    if (!canEdit) return;
    const hasTag = req.tags.includes(tag.id);
    const newTags = hasTag ? req.tags.filter((t) => t !== tag.id) : [...req.tags, tag.id];
    try {
      await updateRequirement(
        req.id,
        { tags: newTags },
        currentUser.uid,
        currentUser.displayName,
        currentUser.color
      );
    } catch {
      toast.error('Failed to update tags');
    }
  }

  const reqTags = project.tags?.filter((t) => req.tags.includes(t.id)) || [];

  return (
    <div
      className={`req-row fade-in ${req.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      id={`req-${req.id}`}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Color dot */}
      <div
        className="color-dot"
        style={{
          background: req.lastEditorColor || '#94a3b8',
          marginTop: '0.2rem',
          flexShrink: 0,
        }}
        title={`Last edited by ${req.lastEditorName || 'Unknown'}`}
      />

      {/* Checkbox */}
      <input
        type="checkbox"
        className="checkbox"
        checked={req.completed}
        onChange={handleToggle}
        disabled={!canCheckbox || saving}
        style={{ marginTop: '0.05rem', flexShrink: 0 }}
        id={`checkbox-${req.id}`}
        aria-label={`Mark requirement ${index + 1} as ${req.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Description */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <textarea
            ref={textareaRef}
            className="input text-sm"
            style={{ minHeight: 72, resize: 'vertical' }}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveEdit();
              if (e.key === 'Escape') { setEditing(false); setEditValue(req.description); }
            }}
            id={`edit-${req.id}`}
          />
        ) : (
          <p
            className="text-sm"
            style={{
              color: 'var(--text-primary)',
              textDecoration: req.completed ? 'line-through' : 'none',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {req.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {/* Tags */}
          {reqTags.map((tag) => (
            <span
              key={tag.id}
              className="tag-chip"
              style={{ background: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}

          {/* Due date */}
          {dueDateStr && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: isOverdue ? '#ef4444' : 'var(--text-muted)' }}
            >
              <Calendar size={10} />
              {dueDateStr}
              {isOverdue && ' · Overdue'}
            </span>
          )}

          {/* AI confidence */}
          <ConfidenceDot value={req.confidence} />

          {/* Last editor */}
          {lastEditor && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <span
                className="color-dot"
                style={{ width: 6, height: 6, background: lastEditor.color }}
              />
              {lastEditor.displayName}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {editing ? (
          <>
            <button
              className="btn btn-primary btn-icon btn-sm"
              onClick={handleSaveEdit}
              disabled={saving}
              title="Save (Ctrl+Enter)"
              id={`save-req-${req.id}`}
            >
              <Check size={14} />
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => { setEditing(false); setEditValue(req.description); }}
              title="Cancel"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            {/* Tag toggle */}
            {canEdit && project.tags?.length > 0 && (
              <div className="relative">
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => setShowTagMenu((v) => !v)}
                  title="Add/remove tags"
                  id={`tag-btn-${req.id}`}
                >
                  <TagIcon size={14} />
                </button>
                {showTagMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 rounded-xl shadow-lg py-1 z-50"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      minWidth: 160,
                    }}
                    onMouseLeave={() => setShowTagMenu(false)}
                  >
                    {project.tags.map((tag) => (
                      <button
                        key={tag.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm w-full text-left hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                        onClick={() => { toggleTag(tag); setShowTagMenu(false); }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, display: 'inline-block', flexShrink: 0 }} />
                        {tag.name}
                        {req.tags.includes(tag.id) && <Check size={12} style={{ marginLeft: 'auto', color: '#22c55e' }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Edit */}
            {canEdit && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setEditing(true)}
                title="Edit"
                id={`edit-btn-${req.id}`}
              >
                <Edit3 size={14} />
              </button>
            )}

            {/* Version history */}
            {req.versions && req.versions.length > 0 && onHistoryOpen && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => onHistoryOpen(req)}
                title={`${req.versions.length} version${req.versions.length !== 1 ? 's' : ''}`}
                id={`history-btn-${req.id}`}
              >
                <History size={14} />
              </button>
            )}

            {/* Delete */}
            {(canEdit || isAdmin) && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete"
                id={`delete-req-${req.id}`}
                style={{ color: deleting ? 'var(--text-muted)' : undefined }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
});
