"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { UserProfile, DEFAULT_COLORS } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    color: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getRandomColor(): string {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserProfile(uid: string): Promise<UserProfile | null> {
    const maxRetries = 3;
    let lastErr: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const docRef = doc(firebaseDb(), "users", uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { uid, ...snap.data() } as UserProfile;
        }
        return null;
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries - 1) {
          // Retry with exponential backoff
          const delayMs = Math.pow(2, attempt) * 1000;
          console.warn(
            `Failed to load user profile (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms...`,
            lastErr.message,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    console.error("Failed to load user profile after retries:", lastErr);
    return null;
  }

  // Check if profile exists without retries (for sign-up flow)
  async function profileExists(uid: string): Promise<boolean> {
    try {
      const docRef = doc(firebaseDb(), "users", uid);
      const snap = await getDoc(docRef);
      return snap.exists();
    } catch (err) {
      console.warn("Failed to check if profile exists:", err);
      return false;
    }
  }

  async function refreshProfile() {
    if (user) {
      const profile = await loadUserProfile(user.uid);
      setUserProfile(profile);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth(),
      async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            let profile = await loadUserProfile(firebaseUser.uid);
            
            // Self-heal: If profile doesn't exist in Firestore (e.g. database was created after Auth), create it now.
            if (!profile) {
              const newProfile = {
                email: firebaseUser.email || "user@example.com",
                displayName: firebaseUser.displayName || "User",
                color: getRandomColor(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };
              await setDoc(doc(firebaseDb(), "users", firebaseUser.uid), newProfile, { merge: true });
              profile = { uid: firebaseUser.uid, ...newProfile } as UserProfile;
            }
            
            setUserProfile(profile);
          } catch (err) {
            console.error("Auth state change error:", err);
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(firebaseAuth(), email, password);
  }

  async function signUp(
    email: string,
    password: string,
    displayName: string,
    color: string,
  ) {
    const cred = await createUserWithEmailAndPassword(
      firebaseAuth(),
      email,
      password,
    );
    await updateProfile(cred.user, { displayName });
    const userDoc = {
      email,
      displayName,
      color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(firebaseDb(), "users", cred.user.uid), userDoc);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(firebaseAuth(), provider);
    const existing = await profileExists(cred.user.uid);
    if (!existing) {
      await setDoc(doc(firebaseDb(), "users", cred.user.uid), {
        email: cred.user.email,
        displayName: cred.user.displayName || "User",
        color: getRandomColor(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async function signInAsGuest() {
    const cred = await signInAnonymously(firebaseAuth());
    const existing = await profileExists(cred.user.uid);
    if (!existing) {
      await setDoc(doc(firebaseDb(), "users", cred.user.uid), {
        email: "guest@anonymous.local",
        displayName: "Guest User",
        color: getRandomColor(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async function signOut() {
    await firebaseSignOut(firebaseAuth());
    setUserProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
