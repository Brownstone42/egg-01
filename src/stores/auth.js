import { defineStore } from 'pinia';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  actions: {
    init() {
      onAuthStateChanged(auth, (currentUser) => {
        this.user = currentUser;
      });
    },
    loginWithGoogle() {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider).catch((error) => {
        console.error('Login failed:', error);
      });
    },
    logout() {
      signOut(auth).catch((error) => {
        console.error('Logout failed:', error);
      });
    },
  },
});
