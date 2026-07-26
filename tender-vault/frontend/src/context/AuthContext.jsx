import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
} from 'firebase/auth';
import { auth } from '../firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const result = await firebaseUser.getIdTokenResult();
        setUser(firebaseUser);
        setClaims(result.claims);
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  // Force a token refresh after claims are set server-side (e.g. after
  // provisionCompany or addUser) and update local claims state.
  const refreshClaims = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.getIdToken(true);
    const result = await auth.currentUser.getIdTokenResult();
    setClaims(result.claims);
    return result.claims;
  };

  return (
    <AuthContext.Provider
      value={{ user, claims, loading, login, signup, logout, refreshClaims }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
