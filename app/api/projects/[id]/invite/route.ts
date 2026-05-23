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

// POST /api/projects/[id]/invite — invite a user by email
export async function POST(
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
      return NextResponse.json({ error: 'Only admin can invite members' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email in Firestore
    const usersSnap = await adminDb()
      .collection('users')
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return NextResponse.json(
        { error: 'No account found with that email. Ask them to sign up first.' },
        { status: 404 }
      );
    }

    const invitedUid = usersSnap.docs[0].id;
    if (project.teamMembers.includes(invitedUid)) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 409 });
    }

    await adminDb()
      .collection('projects')
      .doc(projectId)
      .update({
        teamMembers: [...project.teamMembers, invitedUid],
        updatedAt: new Date(),
      });

    const invitedUser = usersSnap.docs[0].data();
    return NextResponse.json({
      success: true,
      invitedUser: { uid: invitedUid, displayName: invitedUser.displayName, email: invitedUser.email, color: invitedUser.color },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 });
  }
}
