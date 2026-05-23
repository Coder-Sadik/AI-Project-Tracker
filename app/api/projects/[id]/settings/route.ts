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

// PATCH /api/projects/[id]/settings — update name or editing level (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId } = await params;

  try {
    const projectSnap = await adminDb().collection('projects').doc(projectId).get();
    if (!projectSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = projectSnap.data()!;
    if (project.createdBy !== uid) {
      return NextResponse.json({ error: 'Only admin can change settings' }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.editingLevel !== undefined) {
      if (!['full', 'checkboxesOnly'].includes(body.editingLevel)) {
        return NextResponse.json({ error: 'Invalid editing level' }, { status: 400 });
      }
      updates.editingLevel = body.editingLevel;
    }

    await adminDb().collection('projects').doc(projectId).update(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
