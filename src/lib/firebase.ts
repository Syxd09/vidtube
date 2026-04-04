import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDeRGrUwtRsE8d9dMJBJHtWXQhH1RoZgxY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cortex-os.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cortex-os",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cortex-os.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "697877918037",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:697877918037:web:3aa38c91cf49d471c83fdc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D2MW9NNBX9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
