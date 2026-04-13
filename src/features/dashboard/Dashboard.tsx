"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/shared/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Bid } from '@/features/bids/types';
import { useAuth } from '@/features/auth/AuthContext';
import styles from './Dashboard.module.css';
import { TrendingUp, Target, CheckCircle, XCircle, PoundSterling, FileText } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bids'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Bid);
      setBids(data);
    });
    return () => unsubscribe();
  }, []);

  const metrics = useMemo(() => {
    const totalPipeline = bids.reduce((sum, b) => sum + (b.amount || 0), 0);
    const successful = bids.filter(b => b.status === 'Successful');
    const successfulAmount = successful.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    const unsuccessful = bids.filter(b => b.status === 'Unsuccessful');
    const unsuccessfulAmount = unsuccessful.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    const submitted = bids.filter(b => b.status === 'Submitted');
    const submittedAmount = submitted.reduce((sum, b) => sum + (b.amount || 0), 0);

    const winRate = successful.length + unsuccessful.length > 0 
      ? Math.round((successful.length / (successful.length + unsuccessful.length)) * 100) 
      : 0;

    return { totalPipeline, successfulAmount, unsuccessfulAmount, submittedAmount, winRate, count: bids.length };
  }, [bids]);

  const formatCurrency = (val: number) => `£${val.toLocaleString()}`;

  // Parse First Name for greeting
  let firstName = 'Team';
  if (user?.displayName) {
    firstName = user.displayName.split(' ')[0];
  } else if (user?.email) {
    const firstPart = user.email.split('@')[0].split('.')[0];
    firstName = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome back, {firstName}</h1>
        <p>Your funding pipeline at a glance.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Bid Pipeline</span>
            <span className={styles.statValue}>{formatCurrency(metrics.totalPipeline)}</span>
            <span className={styles.statSubtext}>{metrics.count} Applications Total</span>
          </div>
          <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <Target size={24} />
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Successfully Won</span>
            <span className={styles.statValue} style={{ color: '#10b981' }}>{formatCurrency(metrics.successfulAmount)}</span>
            <span className={styles.statSubtext}>Confirmed Revenue</span>
          </div>
          <div className={`${styles.iconWrapper} ${styles.green}`}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>In Submission</span>
            <span className={styles.statValue} style={{ color: '#3b82f6' }}>{formatCurrency(metrics.submittedAmount)}</span>
            <span className={styles.statSubtext}>Awaiting Outcomes</span>
          </div>
          <div className={`${styles.iconWrapper} ${styles.purple}`}>
            <FileText size={24} />
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Success Rate</span>
            <span className={styles.statValue}>{metrics.winRate}%</span>
            <span className={styles.statSubtext}>Win/Loss Ratio</span>
          </div>
          <div className={`${styles.iconWrapper} ${styles.orange}`}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={`glass-panel ${styles.recentBids}`}>
           <h3>Latest Bid Activity</h3>
           <div className={styles.bidList}>
             {bids.slice(0, 5).map((bid, i) => (
               <div key={i} className={styles.bidItem}>
                 <div className={styles.bidDot} style={{ 
                   backgroundColor: bid.status === 'Successful' ? '#10b981' : 
                                   bid.status === 'Unsuccessful' ? '#ef4444' : '#3b82f6' 
                 }}></div>
                 <div className={styles.bidMain}>
                    <strong>{bid.fundName}</strong>
                    <span>{bid.status}</span>
                 </div>
                 <div className={styles.bidValue}>{formatCurrency(bid.amount || 0)}</div>
               </div>
             ))}
             {bids.length === 0 && <p className={styles.empty}>No bids logged yet.</p>}
           </div>
        </div>
        
        <div className={`glass-panel ${styles.summaryCard}`}>
           <h3>Lost Opportunities</h3>
           <p className={styles.lostValue}>{formatCurrency(metrics.unsuccessfulAmount)}</p>
           <span className={styles.lostLabel}>This represents funding targets that were not secured.</span>
           <div className={styles.lostIcon}>
              <XCircle size={40} color="#ef4444" opacity={0.2} />
           </div>
        </div>
      </div>
    </div>
  );
};
