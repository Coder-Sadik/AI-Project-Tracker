'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getProject,
  getUserProfile,
  subscribeToRequirements,
  removeMember,
  deleteProject,
  addTagToProject,
  removeTagFromProject,
  addActivity,
} from '@/lib/firestore';
import { Project, Requirement, UserProfile, Tag, TAG_COLORS } from '@/types';
import Navbar from '@/components/navbar';
import RequirementRow from '@/components/requirements/requirement-row';
import AddRequirementForm from '@/components/requirements/add-requirement-form';
import ActivityFeed from '@/components/activity/activity-feed';
import ExportMenu from '@/components/export/export-menu';
import VersionHistoryModal from '@/components/requirements/version-history-modal';
import toast from 'react-hot-toast';
import {
  Settings,
  Users,
  Activity,
  ChevronRight,
  ChevronLeft,
  Loader2,
  UserPlus,
  Trash2,
  Plus,
  X,
  Filter,
  CheckSquare,
  Square,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: Props) {
  const { id: projectId } = use(params);
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'settings' | 'members'>('members');

  // Version history
  const [historyReq, setHistoryReq] = useState<Requirement | null>(null);

  // Filters
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Admin forms
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Tag management
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [addingTag, setAddingTag] = useState(false);

  const isAdmin = project?.createdBy === user?.uid;
  const editingLevel = project?.editingLevel || 'full';
  const canEdit = isAdmin || editingLevel === 'full';
  const canCheckbox = isAdmin || editingLevel === 'full' || editingLevel === 'checkboxesOnly';

  const completedCount = requirements.filter((r) => r.completed).length;
  const progress = requirements.length > 0 ? (completedCount / requirements.length) * 100 : 0;

  const filteredReqs = requirements.filter((r) => {
    if (filterTag && !r.tags.includes(filterTag)) return false;
    if (filterStatus === 'active' && r.completed) return false;
    if (filterStatus === 'completed' && !r.completed) return false;
    return true;
  });

  const currentUserObj = useMemo(() => ({
    uid: user?.uid || '',
    displayName: userProfile?.displayName || 'User',
    color: userProfile?.color || '#94a3b8',
  }), [user?.uid, userProfile?.displayName, userProfile?.color]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function loadProject() {
      const p = await getProject(projectId);
      if (!p || !p.teamMembers.includes(user!.uid)) {
        router.push('/dashboard');
        return;
      }
      setProject(p);
      setNewName(p.name);

      // Load member profiles
      const profiles: Record<string, UserProfile> = {};
      await Promise.all(
        p.teamMembers.map(async (uid) => {
          const profile = await getUserProfile(uid);
          if (profile) profiles[uid] = profile;
        })
      );
      setMemberProfiles(profiles);
      setLoading(false);
    }
    loadProject();
  }, [user, projectId, router]);

  // Real-time requirements
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRequirements(projectId, (reqs) => {
      setRequirements(reqs);
    });
    return unsub;
  }, [projectId, user]);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`${data.invitedUser.displayName} added to project!`);
      setInviteEmail('');

      // Refresh member profiles
      const newProfile = data.invitedUser as UserProfile;
      setMemberProfiles((prev) => ({ ...prev, [newProfile.uid]: newProfile }));
      setProject((prev) =>
        prev
          ? { ...prev, teamMembers: [...prev.teamMembers, newProfile.uid] }
          : prev
      );

      await addActivity(
        projectId,
        'invited_member',
        user!.uid,
        userProfile!.displayName,
        userProfile!.color,
        data.invitedUser.displayName
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to invite';
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(uid: string) {
    if (!isAdmin || uid === user!.uid) return;
    if (!confirm('Remove this team member?')) return;
    try {
      await removeMember(projectId, uid);
      setProject((prev) =>
        prev ? { ...prev, teamMembers: prev.teamMembers.filter((m) => m !== uid) } : prev
      );
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  }

  async function handleUpdateName() {
    if (!newName.trim() || newName === project?.name) {
      setEditingName(false);
      return;
    }
    try {
      const token = await user!.getIdToken();
      await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim() }),
      });
      setProject((prev) => prev ? { ...prev, name: newName.trim() } : prev);
      toast.success('Project name updated');
      setEditingName(false);
    } catch {
      toast.error('Failed to update name');
    }
  }

  async function handleEditingLevelChange(level: 'full' | 'checkboxesOnly') {
    try {
      const token = await user!.getIdToken();
      await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ editingLevel: level }),
      });
      setProject((prev) => prev ? { ...prev, editingLevel: level } : prev);
      toast.success('Editing level updated');
    } catch {
      toast.error('Failed to update');
    }
  }

  async function handleDeleteProject() {
    if (!isAdmin) return;
    if (!confirm('Delete this project and all its requirements? This cannot be undone.')) return;
    try {
      await deleteProject(projectId);
      router.push('/dashboard');
    } catch {
      toast.error('Failed to delete project');
    }
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return;
    const tag: Tag = {
      id: `${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
    };
    try {
      await addTagToProject(projectId, tag);
      setProject((prev) => prev ? { ...prev, tags: [...(prev.tags || []), tag] } : prev);
      setNewTagName('');
      setAddingTag(false);
      toast.success('Tag added');
    } catch {
      toast.error('Failed to add tag');
    }
  }

  async function handleRemoveTag(tag: Tag) {
    try {
      await removeTagFromProject(projectId, tag);
      setProject((prev) => prev ? { ...prev, tags: prev.tags.filter((t) => t.id !== tag.id) } : prev);
      toast.success('Tag removed');
    } catch {
      toast.error('Failed to remove tag');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Version history modal */}
      {historyReq && currentUserObj && (
        <VersionHistoryModal
          req={historyReq}
          onClose={() => setHistoryReq(null)}
          currentUser={currentUserObj}
          projectId={projectId}
          canEdit={canEdit}
        />
      )}

      <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
        <div
          className="sidebar flex-shrink-0 flex flex-col"
          style={{
            width: sidebarOpen ? 280 : 0,
            minWidth: sidebarOpen ? 280 : 0,
            overflow: 'hidden',
            transition: 'width 0.25s ease, min-width 0.25s ease',
          }}
        >
          {sidebarOpen && (
            <div
              className="flex flex-col h-full"
              style={{ padding: '1.25rem', overflowY: 'auto', minWidth: 280 }}
            >
              {/* Project name */}
              <div className="mb-4">
                {editingName && isAdmin ? (
                  <div className="flex gap-1">
                    <input
                      id="project-name-edit"
                      className="input text-sm font-semibold flex-1"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); if (e.key === 'Escape') setEditingName(false); }}
                      autoFocus
                    />
                    <button className="btn btn-primary btn-icon btn-sm" onClick={handleUpdateName}><CheckSquare size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditingName(false)}><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <h2
                      className="font-bold text-base flex-1"
                      style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
                    >
                      {project.name}
                    </h2>
                    {isAdmin && (
                      <button
                        className="btn btn-ghost btn-icon btn-sm flex-shrink-0"
                        onClick={() => setEditingName(true)}
                        title="Rename project"
                      >
                        <Settings size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{completedCount} of {requirements.length} completed</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Budget & Timeline */}
              {(project.budget || project.timeline) && (
                <div className="mb-5 flex flex-col gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="font-medium">Budget:</span> 
                      <span className="truncate">{project.budget}</span>
                    </div>
                  )}
                  {project.timeline && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="font-medium">Timeline:</span> 
                      <span className="truncate">{project.timeline}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Panel tabs */}
              <div className="flex gap-1 mb-4">
                <button
                  className={`btn btn-sm flex-1 ${activePanel === 'members' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActivePanel('members')}
                  id="members-tab"
                >
                  <Users size={13} /> Team
                </button>
                {isAdmin && (
                  <button
                    className={`btn btn-sm flex-1 ${activePanel === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActivePanel('settings')}
                    id="settings-tab"
                  >
                    <Settings size={13} /> Settings
                  </button>
                )}
              </div>

              {/* MEMBERS panel */}
              {activePanel === 'members' && (
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col gap-2">
                    {project.teamMembers.map((uid) => {
                      const m = memberProfiles[uid];
                      if (!m) return null;
                      return (
                        <div
                          key={uid}
                          className="flex items-center gap-2"
                          id={`member-${uid}`}
                        >
                          <div
                            className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
                            style={{ width: 30, height: 30, background: m.color, fontSize: '0.7rem' }}
                          >
                            {m.displayName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {m.displayName}
                              {uid === project.createdBy && (
                                <span className="ml-1 text-xs" style={{ color: 'var(--brand-500)' }}>Admin</span>
                              )}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                          </div>
                          {isAdmin && uid !== user!.uid && (
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleRemoveMember(uid)}
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Invite */}
                  {isAdmin && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        <input
                          id="invite-email"
                          className="input text-sm flex-1"
                          placeholder="Invite by email…"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                        />
                        <button
                          id="invite-btn"
                          className="btn btn-primary btn-icon"
                          onClick={handleInvite}
                          disabled={inviting || !inviteEmail.trim()}
                        >
                          {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS panel */}
              {activePanel === 'settings' && isAdmin && (
                <div className="flex flex-col gap-4 flex-1">
                  {/* Editing level */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      Team Editing Level
                    </p>
                    <div className="flex flex-col gap-1">
                      {(['full', 'checkboxesOnly'] as const).map((level) => (
                        <button
                          key={level}
                          id={`editing-level-${level}`}
                          className={`btn btn-sm text-left ${editingLevel === level ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ justifyContent: 'flex-start' }}
                          onClick={() => handleEditingLevelChange(level)}
                        >
                          {level === 'full' ? '✏️ Full Editing' : '☑️ Checkbox Only'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Tags
                      </p>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setAddingTag(true)}>
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {(project.tags || []).map((tag) => (
                        <div
                          key={tag.id}
                          className="tag-chip flex items-center gap-1"
                          style={{ background: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: tag.color, padding: 0, lineHeight: 1 }}
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {addingTag && (
                      <div className="flex flex-col gap-2 p-2 rounded-lg fade-in" style={{ background: 'var(--bg-secondary)' }}>
                        <input
                          className="input text-xs"
                          placeholder="Tag name…"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          autoFocus
                          id="new-tag-input"
                        />
                        <div className="flex gap-1 flex-wrap">
                          {TAG_COLORS.map((c) => (
                            <button
                              key={c}
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: c,
                                border: newTagColor === c ? '2px solid white' : '2px solid transparent',
                                outline: newTagColor === c ? `2px solid ${c}` : 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() => setNewTagColor(c)}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <button className="btn btn-primary btn-sm flex-1" style={{ justifyContent: 'center' }} onClick={handleAddTag} disabled={!newTagName.trim()}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setAddingTag(false)}><X size={12} /></button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Danger zone */}
                  <div className="mt-auto">
                    <div className="divider" />
                    <button
                      id="delete-project-btn"
                      className="btn btn-danger btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleDeleteProject}
                    >
                      <Trash2 size={14} />
                      Delete Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar toggle */}
        <button
          className="flex items-center justify-center flex-shrink-0 hover:bg-[var(--bg-secondary)] transition-colors"
          style={{
            width: 20,
            background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-default)',
            borderRight: '1px solid var(--border-default)',
            cursor: 'pointer',
            border: 'none',
          }}
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          id="sidebar-toggle"
        >
          {sidebarOpen ? <ChevronLeft size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div
            className="flex items-center gap-3 px-6 py-3"
            style={{
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-card)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {/* Filter by status */}
            <div className="flex gap-1">
              {(['all', 'active', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  id={`filter-${s}`}
                  className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === 'all' && <Square size={13} />}
                  {s === 'completed' && <CheckSquare size={13} />}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Filter by tag */}
            {(project.tags || []).length > 0 && (
              <div className="flex gap-1 flex-wrap">
                <button
                  className={`btn btn-sm ${!filterTag ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterTag(null)}
                >
                  <Filter size={13} /> All
                </button>
                {project.tags.map((tag) => (
                  <button
                    key={tag.id}
                    id={`filter-tag-${tag.id}`}
                    className={`btn btn-sm ${filterTag === tag.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color, display: 'inline-block' }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            <div className="ml-auto flex gap-2">
              <ExportMenu project={project} requirements={requirements} />
              <button
                id="activity-toggle"
                className={`btn btn-sm ${activityOpen ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActivityOpen((v) => !v)}
              >
                <Activity size={14} />
                <span className="hide-mobile">Activity</span>
              </button>
            </div>
          </div>

          {/* Requirements area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ padding: '1.5rem' }}>
              {/* Stats */}
              <div className="flex items-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {filteredReqs.length} requirement{filteredReqs.length !== 1 ? 's' : ''}
                  {filterTag || filterStatus !== 'all' ? ' (filtered)' : ''}
                </span>
              </div>

              {/* Requirement list */}
              <div className="flex flex-col gap-1">
                {filteredReqs.map((req, i) => (
                  <RequirementRow
                    key={req.id}
                    req={req}
                    project={project}
                    currentUser={currentUserObj}
                    memberProfiles={memberProfiles}
                    canEdit={canEdit}
                    canCheckbox={canCheckbox}
                    isAdmin={isAdmin}
                    onHistoryOpen={setHistoryReq}
                    index={i}
                  />
                ))}
              </div>

              {/* Empty state */}
              {filteredReqs.length === 0 && requirements.length === 0 && (
                <div className="text-center py-12">
                  <Square size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
                  <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No requirements yet</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add your first requirement below</p>
                </div>
              )}

              {/* Add form */}
              {canEdit && currentUserObj && (
                <AddRequirementForm
                  projectId={projectId}
                  currentUser={currentUserObj}
                />
              )}
            </div>

            {/* ── ACTIVITY PANEL ─────────────────────────────────────── */}
            {activityOpen && (
              <div
                className="flex-shrink-0 slide-in-right"
                style={{
                  width: 300,
                  borderLeft: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border-default)' }}
                >
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Activity Log
                  </h3>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setActivityOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ padding: '0.75rem 1rem' }}>
                  <ActivityFeed projectId={projectId} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
