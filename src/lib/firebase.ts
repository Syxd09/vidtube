import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDeRGrUwtRsE8d9dMJBJHtWXQhH1RoZgxY",
  authDomain: "vidtube-9cf35.firebaseapp.com",
  projectId: "vidtube-9cf35",
  storageBucket: "vidtube-9cf35.firebasestorage.app",
  messagingSenderId: "697877918037",
  appId: "1:697877918037:web:3aa38c91cf49d471c83fdc",
  measurementId: "G-D2MW9NNBX9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
