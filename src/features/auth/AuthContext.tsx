"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import styles from './AuthContext.module.css';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';

interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: SessionUser | null;
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
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Viewer');
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authFormLoading, setAuthFormLoading] = useState(false);

  useEffect(() => {
    // Fetch session on mount
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        if (res.ok && data.user) {
          setUser(data.user);
          setUserRole(data.role);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthFormLoading(true);
    
    try {
      if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed');
        }
        
        setUser({ uid: 'server-session', email: data.user.email, displayName: '' });
        setUserRole(data.user.role);
      } else {
        throw new Error("Registration is handled by admins only in this setup.");
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      setAuthError(error.message || "Authentication failed.");
    } finally {
      setAuthFormLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading System...</div>;
  }

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
