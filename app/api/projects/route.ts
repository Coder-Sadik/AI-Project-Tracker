import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

async function getUidFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// GET /api/projects — list projects for authenticated user
export async function GET(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const snap = await adminDb()
      .collection('projects')
      .where('teamMembers', 'array-contains', uid)
      .orderBy('updatedAt', 'desc')
      .get();

    const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ projects });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects — create a project manually
export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const ref = await adminDb().collection('projects').add({
      name: name.trim(),
      createdBy: uid,
      teamMembers: [uid],
      editingLevel: 'full',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ projectId: ref.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
