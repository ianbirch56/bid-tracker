"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/shared/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/shared/components/Toast/ToastProvider';
import { Search, UserPlus, Mail, Phone, Building2, Trash2 } from 'lucide-react';
import styles from './ContactDirectory.module.css';

export interface Contact {
  id?: string;
  name: string;
  role: string;
  organisation: string;
  email: string;
  phone?: string;
}

export const ContactDirectory = () => {
  const { addToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contact[];
      setContacts(data.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return () => unsubscribe();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'contacts'), newContact);
      setIsModalOpen(false);
      setNewContact({});
      addToast('Contact Added', 'success');
    } catch (error: any) {
      addToast('Error', 'error', error.message);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (confirm("Delete this contact?")) {
      await deleteDoc(doc(db, 'contacts', id));
      addToast('Deleted', 'success');
    }
  };

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.organisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Funder Directory</h1>
          <p>Key contacts for Trusts, Foundations, and Partners.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          Add Contact
        </button>
      </header>

      <div className={styles.searchBar}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by name or trust..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {filtered.map(contact => (
          <div key={contact.id} className={`glass-panel ${styles.card}`}>
            <div className={styles.avatar}>{contact.name.charAt(0)}</div>
            <h3>{contact.name}</h3>
            <p className={styles.role}>{contact.role}</p>
            
            <div className={styles.info}>
              <div className={styles.infoRow}><Building2 size={14} /> {contact.organisation}</div>
              <div className={styles.infoRow}><Mail size={14} /> {contact.email}</div>
            </div>

            <button className={styles.deleteBtn} onClick={() => handleDelete(contact.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={`glass-panel ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <h2>New Funder Contact</h2>
            <form onSubmit={handleSaveContact} className={styles.form}>
              <input placeholder="Name" onChange={e => setNewContact({...newContact, name: e.target.value})} required />
              <input placeholder="Role" onChange={e => setNewContact({...newContact, role: e.target.value})} required />
              <input placeholder="Organisation" onChange={e => setNewContact({...newContact, organisation: e.target.value})} required />
              <input type="email" placeholder="Email" onChange={e => setNewContact({...newContact, email: e.target.value})} required />
              <button type="submit" className="btn-primary">Save Contact</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
