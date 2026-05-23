'use client';

import Link from 'next/link';
import { Project, UserProfile } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Users, Calendar, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  project: Project;
  memberProfiles: Record<string, UserProfile>;
  requirementCount?: number;
  completedCount?: number;
}

export default function ProjectCard({ project, memberProfiles, requirementCount = 0, completedCount = 0 }: Props) {
  const progress = requirementCount > 0 ? (completedCount / requirementCount) * 100 : 0;
  const updatedAt = project.updatedAt?.toDate?.();
  const timeAgo = updatedAt ? formatDistanceToNow(updatedAt, { addSuffix: true }) : 'recently';
  const members = project.teamMembers.map((uid) => memberProfiles[uid]).filter(Boolean);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="card card-interactive block"
      style={{ padding: '1.5rem', textDecoration: 'none', display: 'block' }}
      id={`project-card-${project.id}`}
    >
      {/* Project name */}
      <h3
        className="font-bold text-lg mb-1 line-clamp-2"
        style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
      >
        {project.name}
      </h3>

      {/* Meta row */}
      <div
        className="flex items-center gap-3 mb-4"
        style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
      >
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {timeAgo}
        </span>
        <span className="flex items-center gap-1">
          {requirementCount > 0 ? (
            <>
              <CheckCircle2 size={12} />
              {completedCount}/{requirementCount} done
            </>
          ) : (
            <>
              <Circle size={12} />
              No requirements
            </>
          )}
        </span>
      </div>

      {/* Progress bar */}
      {requirementCount > 0 && (
        <div className="progress-bar mb-4">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="tag-chip"
              style={{ background: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="tag-chip" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer — members + editing level */}
      <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
        {/* Member avatars */}
        <div className="flex items-center gap-1">
          <Users size={12} style={{ color: 'var(--text-muted)', marginRight: 4 }} />
          <div className="flex" style={{ gap: -4 }}>
            {members.slice(0, 5).map((m) => (
              <div
                key={m.uid}
                className="tooltip-container"
                style={{ marginLeft: members.indexOf(m) > 0 ? -8 : 0 }}
              >
                <div
                  className="flex items-center justify-center rounded-full text-white font-bold"
                  style={{
                    width: 24,
                    height: 24,
                    background: m.color,
                    border: '2px solid var(--bg-card)',
                    fontSize: '0.625rem',
                  }}
                >
                  {m.displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="tooltip">{m.displayName}</span>
              </div>
            ))}
            {members.length > 5 && (
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--bg-card)',
                  fontSize: '0.625rem',
                  color: 'var(--text-muted)',
                  marginLeft: -8,
                }}
              >
                +{members.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Editing level badge */}
        <span
          className="badge"
          style={{
            background: project.editingLevel === 'full' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
            color: project.editingLevel === 'full' ? '#22c55e' : '#f59e0b',
          }}
        >
          {project.editingLevel === 'full' ? 'Full edit' : 'Checkbox only'}
        </span>
      </div>
    </Link>
  );
}
