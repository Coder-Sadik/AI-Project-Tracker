import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, initializeFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.projectId) {
  console.error("Firebase config incomplete. Check your .env.local file.");
}

// Lazy singletons — never evaluated at module load time, only on first call
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

function app(): FirebaseApp {
  if (!_app)
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function firebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(app());
  return _auth;
}

export function firebaseDb(): Firestore {
  if (!_db) {
    _db = initializeFirestore(app(), {
      experimentalForceLongPolling: true,
    });
  }
  return _db;
}

export function firebaseStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(app());
  return _storage;
}
