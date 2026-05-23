import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  color: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  budget?: string;
  timeline?: string;
  createdBy: string;
  teamMembers: string[];
  editingLevel: 'full' | 'checkboxesOnly';
  tags: Tag[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RequirementVersion {
  description: string;
  editedBy: string;
  editorName: string;
  editorColor: string;
  editedAt: Timestamp;
}

export interface Requirement {
  id: string;
  projectId: string;
  description: string;
  completed: boolean;
  lastEditedBy: string;
  lastEditorColor: string;
  lastEditorName: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate: Timestamp | null;
  tags: string[]; // tag ids
  confidence: number | null; // 0-1, from AI extraction
  versions: RequirementVersion[];
}

export type ActivityAction =
  | 'created_project'
  | 'created_requirement'
  | 'edited_description'
  | 'completed'
  | 'uncompleted'
  | 'deleted'
  | 'invited_member'
  | 'added_tag'
  | 'set_due_date'
  | 'reverted_version';

export interface Activity {
  id: string;
  projectId: string;
  requirementId?: string;
  action: ActivityAction;
  userId: string;
  userName: string;
  userColor: string;
  details?: string;
  timestamp: Timestamp;
}

export interface ExtractedRequirement {
  description: string;
  confidence: number;
}

export interface AIAnalysisResult {
  projectName: string;
  budget?: string;
  timeline?: string;
  requirements: ExtractedRequirement[];
}

export interface ProjectWithMembers extends Project {
  members: UserProfile[];
  requirementCount: number;
  completedCount: number;
}

export const DEFAULT_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFA726', '#FFCA28',
  '#66BB6A', '#26C6DA', '#42A5F5', '#7E57C2',
  '#EC407A', '#AB47BC', '#26A69A', '#78909C',
];

export const TAG_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];
