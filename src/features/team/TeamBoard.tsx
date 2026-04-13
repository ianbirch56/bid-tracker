"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/shared/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { useAuth, UserRole } from '@/features/auth/AuthContext';
import { useToast } from '@/shared/components/Toast/ToastProvider';
import { Shield, UserPlus, Mail, ShieldCheck, UserX, MoreVertical } from 'lucide-react';
import styles from './TeamBoard.module.css';

interface TeamMember {
  id?: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  addedAt: string;
}

export const TeamBoard = () => {
  const { userRole } = useAuth();
  const { addToast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New member form
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Viewer');

  useEffect(() => {
    const q = query(collection(db, 'appUsers'), orderBy('addedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeamMember[];
      setMembers(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes('@')) return;
    
    try {
      await addDoc(collection(db, 'appUsers'), {
        email: newEmail.toLowerCase().trim(),
        role: newRole,
        status: 'Active',
        addedAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewEmail('');
      addToast('User Authorized', 'success', `${newEmail} now has access to this project.`);
    } catch (error: any) {
      addToast('Authorization Failed', 'error', error.message);
    }
  };

  const toggleStatus = async (member: TeamMember) => {
    if (!member.id) return;
    const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateDoc(doc(db, 'appUsers', member.id), { status: newStatus });
      addToast('Status Updated', 'info', `User is now ${newStatus}`);
    } catch (error: any) {
      addToast('Update Failed', 'error', error.message);
    }
  };

  const changeRole = async (member: TeamMember, role: UserRole) => {
    if (!member.id) return;
    try {
      await updateDoc(doc(db, 'appUsers', member.id), { role });
      addToast('Role Updated', 'success', `User set to ${role}`);
    } catch (error: any) {
      addToast('Update Failed', 'error', error.message);
    }
  };

  if (userRole !== 'Admin') {
    return <div className={styles.unauthorized}><h1>Access Denied</h1><p>Only Administrators can manage team access.</p></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Team Management</h1>
          <p>Authorize team members and manage their permissions for this app.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          Authorize Team Member
        </button>
      </header>

      <div className={`glass-panel ${styles.tableWrapper}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User Email</th>
              <th>System Role</th>
              <th>Status</th>
              <th>Date Authorized</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className={member.status === 'Inactive' ? styles.inactiveRow : ''}>
                <td>
                  <div className={styles.userEmail}>
                    <Mail size={16} />
                    {member.email}
                  </div>
                </td>
                <td>
                  <select 
                    value={member.role} 
                    onChange={(e) => changeRole(member, e.target.value as UserRole)}
                    className={styles.roleSelect}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${member.status === 'Active' ? styles.active : styles.inactive}`}>
                    {member.status}
                  </span>
                </td>
                <td>{new Date(member.addedAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => toggleStatus(member)}
                  >
                    {member.status === 'Active' ? <UserX size={18} /> : <ShieldCheck size={18} />}
                    {member.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>No authorized users yet. Add your team to allow them to register.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={`glass-panel ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Shield size={24} className={styles.shieldIcon} />
              <h2>Authorize Access</h2>
            </div>
            <form onSubmit={handleAddMember} className={styles.form}>
              <div className={styles.field}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@ymcatrinity.org.uk" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required 
                />
              </div>
              <div className={styles.field}>
                <label>Permission Level</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
                  <option value="Viewer">Viewer (Read Only)</option>
                  <option value="Editor">Editor (Create & Edit)</option>
                  <option value="Admin">Admin (Full Control)</option>
                </select>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Grant Access</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
