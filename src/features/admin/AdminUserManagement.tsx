"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/shared/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/shared/components/Toast/ToastProvider';
import { UserPlus, Shield, Trash2, Mail, User, Wifi } from 'lucide-react';
import styles from './AdminUserManagement.module.css';
import { getApp } from 'firebase/app';

export interface AppUser {
  id?: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Revoked';
  name: string;
}

export const AdminUserManagement = () => {
  const { userRole } = useAuth();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string>('Detecting...');
  
  const [formData, setFormData] = useState<Partial<AppUser>>({
    name: '',
    email: '',
    role: 'Editor',
    status: 'Active'
  });

  useEffect(() => {
    // DIAGNOSTIC CORE: Verify active app instance
    try {
      const app = getApp('funding-tracker');
      const pId = (app.options as any).projectId;
      setActiveProject(pId);
      console.log('🚀 ACTIVE CONNECTION:', pId);
    } catch (e) {
      console.error('❌ Connection Detect Failed:', e);
    }

    const unsubscribe = onSnapshot(collection(db, 'appUsers'), (snapshot) => {
      const data = snapshot.docs.map(document => ({ 
        id: document.id, 
        ...document.data() 
      })) as AppUser[];
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  if (userRole !== 'Admin') {
    return (
      <div className={styles.board}>
        <h1>Unauthorized</h1>
        <p>You do not have permission to manage system access for the Bid Tracker.</p>
      </div>
    );
  }

  const handleDelete = async (id: string | undefined, email: string) => {
    if (!id) return;
    
    if (email === 'ian.birch@ymcatrinity.org.uk') {
      addToast("Action Restricted", "error", "You cannot revoke access for the primary administrator.");
      return;
    }

    if (confirm(`Are you sure you want to revoke access for ${email}?`)) {
      try {
        await deleteDoc(doc(db, 'appUsers', id));
        addToast("Access Revoked", "success", "User will no longer be able to sign in.");
      } catch (error) {
        console.error("Delete Error:", error);
        addToast("Update Failed", "error", "Could not remove user access.");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) return;

    try {
      const docId = formData.email.toLowerCase().trim();
      
      const newUser: AppUser = {
        name: formData.name,
        email: docId,
        role: formData.role as any,
        status: 'Active'
      };

      await setDoc(doc(db, 'appUsers', docId), newUser);

      setIsModalOpen(false);
      addToast("User Pre-Authorized", "success", `${newUser.name} can now sign in.`);
      
      setFormData({ name: '', email: '', role: 'Editor', status: 'Active' });
    } catch (error) {
      console.error("Save Error:", error);
      addToast("Save Failed", "error", "Check your permissions.");
    }
  };

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <div>
          <h1>Bid Tracker Admin</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Pre-authorize users specifically for the Funding Bid Tracker.
            </p>
            <div style={{ 
              background: activeProject === 'funding-tracker-94d6f' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: activeProject === 'funding-tracker-94d6f' ? '#10b981' : '#ef4444',
              padding: '2px 8px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px',
              border: activeProject === 'funding-tracker-94d6f' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Wifi size={10} />
              {activeProject}
            </div>
          </div>
        </div>
        <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} />
          Pre-Authorize User
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email Address</th>
              <th>System Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No pre-authorized users detected in <strong>{activeProject}</strong>.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={16} color="var(--primary)" />
                      {user.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={16} color="var(--text-muted)" />
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge${user.role}`]}`}>
                      <Shield size={12} style={{ marginRight: '4px' }} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      color: user.status === 'Active' ? 'var(--accent)' : 'var(--danger)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      ● {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.btnDanger}
                      onClick={() => handleDelete(user.id, user.email)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{
            padding: '2.5rem', width: '100%', maxWidth: '440px'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Authorize User</h2>
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className={styles.formControl}
                  placeholder="e.g. Sarah Jones"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Work Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className={styles.formControl}
                  placeholder="name@ymcatrinity.org.uk"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Permission Level</label>
                <select 
                  className={styles.formControl}
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="Viewer">Viewer (Read Only)</option>
                  <option value="Editor">Editor (Full Pipeline Access)</option>
                  <option value="Admin">Admin (Full Control)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                  flex: 1, padding: '0.75rem', background: 'transparent',
                  color: 'white', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
