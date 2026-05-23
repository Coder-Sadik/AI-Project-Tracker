import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp;

  if (admin.apps.length > 0) {
    adminApp = admin.apps[0] as admin.app.App;
    return adminApp;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return adminApp;
}

export const adminDb = () => {
  const app = getAdminApp();
  return admin.firestore(app);
};

export const adminAuth = () => {
  const app = getAdminApp();
  return admin.auth(app);
};

export default getAdminApp;
