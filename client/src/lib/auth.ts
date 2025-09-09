import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (import.meta.env.DEV) {
  // Quick sanity check in dev to ensure envs are loaded
  // eslint-disable-next-line no-console
  console.log("[CardCraft] Firebase env loaded:", {
    hasApiKey: !!firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });
}

if (!firebaseConfig.apiKey) {
  throw new Error(
    "Missing VITE_ Firebase config. Ensure .env contains VITE_FIREBASE_* and restart the dev server.",
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<string> {
  const result = await signInWithPopup(auth, provider);
  return await result.user.getIdToken();
}

export function observeAuthState(callback: (user: any | null) => void) {
  return onAuthStateChanged(auth, callback);
}


