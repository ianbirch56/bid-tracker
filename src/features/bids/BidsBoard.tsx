"use client";

import React, { useState, useEffect } from 'react';
import { Bid, BidStatus, StatusOptions } from './types';
import { BidForm } from './BidForm';
import { db } from '@/shared/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/shared/components/Toast/ToastProvider';
import { Plus, Search, Filter, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import styles from './BidsBoard.module.css';

export const BidsBoard = () => {
  const { addToast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BidStatus | 'All'>('All');

  // Fetch Bids from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bids'), (snapshot) => {
      const data = snapshot.docs.map(document => ({ 
        id: document.id, 
        ...document.data() 
      })) as Bid[];
      // Sort newest first
      setBids(data.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
    });
    return () => unsubscribe();
  }, []);

  const handleSaveBid = async (newBid: Bid) => {
    try {
      const { id, ...bidData } = newBid;
      const cleanData = JSON.parse(JSON.stringify(bidData)); // Scrub undefined
      await addDoc(collection(db, 'bids'), cleanData);
      setIsModalOpen(false);
      addToast('Bid Successfully Logged', 'success', `The bid for ${newBid.fundName} is now in the pipeline.`);
    } catch (error: any) {
      console.error(error);
      addToast('Failed to Save', 'error', error.message);
    }
  };

  const handleDeleteBid = async (id: string | undefined) => {
    if (!id) return;
    if (confirm("Are you sure you want to permanently delete this funding bid?")) {
      try {
        await deleteDoc(doc(db, 'bids', id));
        addToast('Bid Erased', 'success');
      } catch (error: any) {
        addToast('Delete Failed', 'error', error.message);
      }
    }
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.fundName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bid.briefAuthor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: BidStatus) => {
    switch (status) {
      case 'Successful': return styles.statusSuccessful;
      case 'Unsuccessful': return styles.statusUnsuccessful;
      case 'Submitted': return styles.statusSubmitted;
      default: return styles.statusDraft;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Funding Bids</h1>
          <p>Track the lifecycle of your grant and tender applications.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Log New Bid
        </button>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by fund or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterWrapper}>
          <Filter size={18} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            {StatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className={`glass-panel ${styles.tableWrapper}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Fund / Project</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Lead</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBids.length > 0 ? filteredBids.map(bid => (
              <tr key={bid.id}>
                <td>{new Date(bid.submissionDate).toLocaleDateString()}</td>
                <td>
                  <div className={styles.primaryText}>{bid.fundName}</div>
                  <div className={styles.secondaryText}>{bid.siteLocation}</div>
                </td>
                <td><span className={styles.typeBadge}>{bid.type}</span></td>
                <td className={styles.amountText}>£{bid.amount.toLocaleString()}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(bid.status)}`}>
                    {bid.status}
                  </span>
                </td>
                <td>{bid.projectLead || bid.briefAuthor}</td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.iconBtn} title="Delete" onClick={() => handleDeleteBid(bid.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className={styles.noData}>No bids found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={`glass-panel ${styles.modalContent}`} onClick={e => e.stopPropagation()}>
            <BidForm onSubmit={handleSaveBid} onCancel={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
