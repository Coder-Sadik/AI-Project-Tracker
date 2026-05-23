import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import {
  Project,
  Requirement,
  Activity,
  UserProfile,
  ActivityAction,
  Tag,
} from '@/types';

// Shorthand helper
const db = () => firebaseDb();

// ── Users ──────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db(), 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function getUsersByEmails(emails: string[]): Promise<UserProfile[]> {
  if (emails.length === 0) return [];
  const q = query(collection(db(), 'users'), where('email', 'in', emails));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const q = query(collection(db(), 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...d.data() } as UserProfile;
}

export async function updateUserColor(uid: string, color: string): Promise<void> {
  await updateDoc(doc(db(), 'users', uid), { color, updatedAt: serverTimestamp() });
}

// ── Projects ───────────────────────────────────────────────────────────────

export async function getProject(projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(db(), 'projects', projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

export async function getUserProjects(uid: string): Promise<Project[]> {
  const q = query(
    collection(db(), 'projects'),
    where('teamMembers', 'array-contains', uid),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function createProject(
  name: string,
  createdBy: string,
  budget?: string,
  timeline?: string
): Promise<string> {
  const ref = await addDoc(collection(db(), 'projects'), {
    name,
    createdBy,
    budget: budget || null,
    timeline: timeline || null,
    teamMembers: [createdBy],
    editingLevel: 'full',
    tags: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(
  projectId: string,
  data: Partial<Omit<Project, 'id'>>
): Promise<void> {
  await updateDoc(doc(db(), 'projects', projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db(), 'projects', projectId));
}

export async function inviteMember(projectId: string, uid: string): Promise<void> {
  await updateDoc(doc(db(), 'projects', projectId), {
    teamMembers: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function removeMember(projectId: string, uid: string): Promise<void> {
  await updateDoc(doc(db(), 'projects', projectId), {
    teamMembers: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function addTagToProject(projectId: string, tag: Tag): Promise<void> {
  await updateDoc(doc(db(), 'projects', projectId), {
    tags: arrayUnion(tag),
    updatedAt: serverTimestamp(),
  });
}

export async function removeTagFromProject(projectId: string, tag: Tag): Promise<void> {
  await updateDoc(doc(db(), 'projects', projectId), {
    tags: arrayRemove(tag),
    updatedAt: serverTimestamp(),
  });
}

// ── Requirements ───────────────────────────────────────────────────────────

export async function getRequirements(projectId: string): Promise<Requirement[]> {
  const q = query(
    collection(db(), 'requirements'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Requirement));
}

export function subscribeToRequirements(
  projectId: string,
  callback: (reqs: Requirement[]) => void
) {
  const q = query(
    collection(db(), 'requirements'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const reqs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Requirement));
    callback(reqs);
  });
}

export async function createRequirement(
  projectId: string,
  description: string,
  createdBy: string,
  creatorName: string,
  creatorColor: string,
  confidence: number | null = null,
  dueDate: Timestamp | null = null,
  tags: string[] = []
): Promise<string> {
  const ref = await addDoc(collection(db(), 'requirements'), {
    projectId,
    description,
    completed: false,
    lastEditedBy: createdBy,
    lastEditorColor: creatorColor,
    lastEditorName: creatorName,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    dueDate,
    tags,
    confidence,
    versions: [],
  });
  return ref.id;
}

export async function updateRequirement(
  reqId: string,
  data: Partial<Omit<Requirement, 'id'>>,
  editorUid: string,
  editorName: string,
  editorColor: string
): Promise<void> {
  await updateDoc(doc(db(), 'requirements', reqId), {
    ...data,
    lastEditedBy: editorUid,
    lastEditorName: editorName,
    lastEditorColor: editorColor,
    updatedAt: serverTimestamp(),
  });
}

export async function updateRequirementDescription(
  req: Requirement,
  newDescription: string,
  editorUid: string,
  editorName: string,
  editorColor: string
): Promise<void> {
  const version = {
    description: req.description,
    editedBy: req.lastEditedBy,
    editorName: req.lastEditorName,
    editorColor: req.lastEditorColor,
    editedAt: req.updatedAt,
  };
  await updateDoc(doc(db(), 'requirements', req.id), {
    description: newDescription,
    lastEditedBy: editorUid,
    lastEditorName: editorName,
    lastEditorColor: editorColor,
    updatedAt: serverTimestamp(),
    versions: arrayUnion(version),
  });
}

export async function deleteRequirement(reqId: string): Promise<void> {
  await deleteDoc(doc(db(), 'requirements', reqId));
}

export async function revertRequirementVersion(
  req: Requirement,
  versionIndex: number,
  editorUid: string,
  editorName: string,
  editorColor: string
): Promise<void> {
  const version = req.versions[versionIndex];
  if (!version) return;
  await updateRequirementDescription(
    req,
    version.description,
    editorUid,
    editorName,
    editorColor
  );
}

// ── Activities ─────────────────────────────────────────────────────────────

export async function addActivity(
  projectId: string,
  action: ActivityAction,
  userId: string,
  userName: string,
  userColor: string,
  details?: string,
  requirementId?: string
): Promise<void> {
  await addDoc(collection(db(), 'activities'), {
    projectId,
    requirementId: requirementId || null,
    action,
    userId,
    userName,
    userColor,
    details: details || null,
    timestamp: serverTimestamp(),
  });
}

export function subscribeToActivities(
  projectId: string,
  callback: (activities: Activity[]) => void
) {
  const q = query(
    collection(db(), 'activities'),
    where('projectId', '==', projectId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const activities = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Activity)
    );
    callback(activities);
  });
}
