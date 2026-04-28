import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "dummy-key",
  authDomain: "vibeflow.firebaseapp.com",
  projectId: "vibeflow",
  storageBucket: "vibeflow.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    // Implementation placeholder for Expo Google SignIn
    console.log("Signing in with Google...");
};
