'use client';

import { useEffect, useState } from 'react';
import { Activity } from '@/types';
import { subscribeToActivities } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Activity as ActivityIcon, Loader2 } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  created_project: 'created project',
  created_requirement: 'added requirement',
  edited_description: 'edited',
  completed: 'completed',
  uncompleted: 'uncompleted',
  deleted: 'deleted requirement',
  invited_member: 'invited',
  added_tag: 'added tag',
  set_due_date: 'set due date',
  reverted_version: 'reverted to version',
};

interface Props {
  projectId: string;
}

export default function ActivityFeed({ projectId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToActivities(projectId, (acts) => {
      setActivities(acts);
      setLoading(false);
    });
    return unsub;
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <ActivityIcon size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
      {activities.map((act) => {
        const timeAgo = act.timestamp?.toDate
          ? formatDistanceToNow(act.timestamp.toDate(), { addSuffix: true })
          : 'recently';

        return (
          <div key={act.id} className="activity-item">
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
              style={{
                width: 26,
                height: 26,
                background: act.userColor || '#94a3b8',
                fontSize: '0.65rem',
                marginTop: 2,
              }}
            >
              {act.userName?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                <span className="font-semibold">{act.userName}</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {ACTION_LABELS[act.action] || act.action}
                </span>
                {act.details && (
                  <>
                    {' '}
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        fontSize: '0.75rem',
                      }}
                    >
                      {act.details}
                    </span>
                  </>
                )}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>
                {timeAgo}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
