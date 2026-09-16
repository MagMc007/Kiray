import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
  try {
    if (getApps().length > 0) {
      app = getApp();
    } else if (isFirebaseConfigured()) {
      app = initializeApp(firebaseConfig);
    } else {
      // Initialize with dummy placeholder if running in dev/test to avoid crashing on import
      app = initializeApp(
        {
          apiKey: 'mock-api-key',
          authDomain: 'mock-project.firebaseapp.com',
          projectId: 'mock-project',
          appId: '1:000000000000:web:mockappid',
        },
        'KIRAY_FALLBACK'
      );
    }

    if (app) {
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export { app, auth, googleProvider };

export const getCurrentIdToken = async (forceRefresh = false): Promise<string | null> => {
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Failed to get current ID token:', error);
    return null;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error('Firebase Auth or Google Provider is not initialized');
  return await signInWithPopup(auth, googleProvider);
};

export const logoutFirebase = async () => {
  if (!auth) return;
  return await signOut(auth);
};

export const subscribeToAuthState = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
