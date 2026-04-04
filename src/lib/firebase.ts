import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ABSOLUTE IDENTITY CONFIGURATION (v38.5)
// DO NOT USE ENVIRONMENT VARIABLES HERE TO PREVENT GHOST CACHING
const firebaseConfig = {
  apiKey: "AIzaSyCgG__2WupvIE5d7e_E-_mMeXjAi39F_e8",
  authDomain: "cortex-os-53422.firebaseapp.com",
  projectId: "cortex-os-53422",
  storageBucket: "cortex-os-53422.firebasestorage.app",
  messagingSenderId: "562563706770",
  appId: "1:562563706770:web:755875efb64bfcd274db4b",
  measurementId: "G-S0GKQD77ZV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
