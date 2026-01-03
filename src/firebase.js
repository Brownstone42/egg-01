import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbZHsblmEiQKWi3K8Zovxunwo-JtvuRlA",
  authDomain: "egg-01-ca15a.firebaseapp.com",
  projectId: "egg-01-ca15a",
  storageBucket: "egg-01-ca15a.firebasestorage.app",
  messagingSenderId: "875055478336",
  appId: "1:875055478336:web:2b9f9b31ec6860394b11a5",
  measurementId: "G-HKZH4JRKNL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };
