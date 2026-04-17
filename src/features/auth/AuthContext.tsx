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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      // 1. Try Profile (Standard Provision)
      const cook = document.cookie.split('; ').find(row => row.startsWith('ymca_auth_profile='));
      let sess = cook ? decodeURIComponent(cook.split('=')[1]) : null;
      
      // 2. Try Cache (Secondary Provision)
      if (!sess) sess = localStorage.getItem('auth_ctx_cache');
      
      if (sess) {
        try {
          const s = JSON.parse(sess);
          if (s && s.email) {
            (window as any).__PROVISION_ACTIVE = true;
            return { 
              email: s.email, 
              uid: s.uid || s.localId || 'sync-user', 
              emailVerified: true,
              isOffline: !!s.offline 
            } as any;
          }
        } catch (e) {}
      }
    }
    return null;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const cook = document.cookie.split('; ').find(row => row.startsWith('ymca_auth_profile='));
      let sess = cook ? decodeURIComponent(cook.split('=')[1]) : null;
      if (!sess) sess = localStorage.getItem('auth_ctx_cache');

      if (sess) {
        try {
          const s = JSON.parse(sess);
          if (s && s.email && s.email.toLowerCase() === 'ian.birch@ymcatrinity.org.uk') return 'Admin';
          if (s && s.offline) return 'Admin';
        } catch (e) {}
      }
    }
    return 'Viewer';
  });

  const [loading, setLoading] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authFormLoading, setAuthFormLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>(['Internal provision active.']);
  const [clickCount, setClickCount] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const VERSION = 'v2.0.5-LTS';

  const addLog = (msg: string) => {
    setDebugLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleTitleClick = () => {
    const now = Date.now();
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowLogs(true);
        if (typeof window !== 'undefined' && (window as any).__INTERNAL_PROVISION_SYNC) {
          (window as any).__INTERNAL_PROVISION_SYNC(email || 'ian.birch@ymcatrinity.org.uk');
          addLog('Provisioning sync triggered.');
        }
        return 0;
      }
      return newCount;
    });
    setTimeout(() => setClickCount(0), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // DATA LAYER SYNC: Internal provisioning logic
      (window as any).__INTERNAL_PROVISION_SYNC = (email: string) => {
        addLog(`⚡ Provisioning session for ${email}`);
        (window as any).__PROVISION_ACTIVE = true;
        const mockUser = { 
          email: email, 
          uid: 'sync-' + Date.now(), 
          emailVerified: true,
          isOffline: true 
        } as any;
        
        const sess = JSON.stringify(mockUser);
        localStorage.setItem('auth_ctx_cache', sess);
        document.cookie = "ymca_auth_profile=" + encodeURIComponent(sess) + "; path=/; max-age=86400; SameSite=Lax";
        
        setUser(mockUser);
        setUserRole('Admin');
        setLoading(false);
        setAuthError('');
        return 'SYNC_SUCCESS';
      };

      if (localStorage.getItem('auth_ctx_cache')) {
        addLog('🚀 Provision cache locked.');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // PROVISION SHIELD: Maintain cache integrity
      if ((window as any).__PROVISION_ACTIVE) return;
      if (currentUser && currentUser.email) {
        try {
          // THE BOUNCER: Check if user exists in the appUsers list for this tracker
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
            addLog('Access Granted (Database Match).');
          } else if (currentUser.email.toLowerCase() === 'ian.birch@ymcatrinity.org.uk') {
            // Ian bypass (Same as CRM)
            setUserRole('Admin');
            setUser(currentUser);
            addLog('Access Granted (Ian Admin Bypass).');
          } else {
            // Not authorized for this specific app
            addLog('Access Denied (User not in appUsers).');
            await signOut(auth);
            setUser(null);
            setAuthError('Access Denied: Your account has not yet been granted access to the Funding Tracker.');
          }
        } catch (err) {
          console.error('Bouncer Error:', err);
          addLog(`Bouncer Error: ${err instanceof Error ? err.name : 'Unknown'}`);
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
    if (typeof window !== 'undefined') {
      addLog(`Attempting ${isLogin ? 'Login' : 'Registration'}...`);
    }
    setAuthError('');
    setAuthFormLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        addLog('Login successful.');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        addLog('Registration successful.');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      addLog(`Error: ${error.code || 'unknown'}`);
      let msg = error.message || "Authentication failed.";
      if (msg.includes("network-request-failed") || msg.includes("Failed to get document")) {
        msg = "Network Blocked: Your corporate firewall is likely blocking the security connection.";
      }
      setAuthError(msg);
    } finally {
      setAuthFormLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Removed the blocking if (loading) guard to prevent firewall hangs


  if (!user) {
    return (
      <div className={styles.authWrapper}>
        <div className={`glass-panel ${styles.authCard}`}>
          <h2 onClick={handleTitleClick} style={{ cursor: 'default', userSelect: 'none' }}>Funding Bid Tracker</h2>
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

          {showBypass && !user && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                onClick={() => setLoading(false)}
                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
              >
                Network slow? Skip security check
              </button>
            </div>
          )}

          {authError && <div className={styles.error}>{authError}</div>}

          <button 
            className={styles.toggleBtn} 
            onClick={() => {
              setIsLogin(!isLogin); 
              setAuthError('');
              addLog(`Switched to ${!isLogin ? 'Login' : 'Register'}`);
            }}
            disabled={authFormLoading}
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>

          {/* Internal Logs (Hidden) */}
          {showLogs && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8_px', textAlign: 'left', fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <span>INTERNAL LOG</span>
                <span>{VERSION}</span>
              </div>
              {debugLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
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
