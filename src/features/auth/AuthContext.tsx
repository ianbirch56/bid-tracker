"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/shared/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from './AuthContext.module.css';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: 'Viewer',
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Viewer');
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authFormLoading, setAuthFormLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        try {
          const q = query(
            collection(db, 'appUsers'), 
            where('email', '==', currentUser.email.toLowerCase().trim()),
            where('status', '==', 'Active')
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const dbUser = snapshot.docs[0].data();
            setUserRole(dbUser.role);
            setUser(currentUser);
          } else {
            await signOut(auth);
            setUser(null);
            setAuthError('Access Denied: Your account has not yet been granted access to the Funding Tracker.');
          }
        } catch (err) {
          console.error('Auth Check Error:', err);
          setAuthError('Security check failed. Please check your connection.');
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthFormLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setAuthError(error.message || "Authentication failed.");
    } finally {
      setAuthFormLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <div className={styles.authWrapper}>
        <div className={`glass-panel ${styles.authCard}`}>
          <div className={styles.logo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <img src="https://www.marcommscrm.co.uk/logo.png" alt="YMCA Logo" style={{ height: '60px', width: 'auto' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#7d8ea3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Funding Tracker</span>
          </div>
          <p>{isLogin ? 'Sign in to access the pipeline' : 'Create an account to request access'}</p>
          
          <form onSubmit={handleAuth} className={styles.authForm}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={authFormLoading}>
              {authFormLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Account')}
            </button>
          </form>

          {authError && <div className={styles.error}>{authError}</div>}

          <button 
            className={styles.toggleBtn} 
            onClick={() => {
              setIsLogin(!isLogin); 
              setAuthError('');
            }}
            disabled={authFormLoading}
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
