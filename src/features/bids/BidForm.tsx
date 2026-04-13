"use client";

import React, { useState } from 'react';
import { Bid, StatusOptions, TypeOptions } from './types';
import styles from './BidForm.module.css';

interface BidFormProps {
  onSubmit: (bid: Bid) => void;
  onCancel: () => void;
  initialData?: Bid;
}

export const BidForm: React.FC<BidFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Bid>>(initialData || {
    submissionDate: new Date().toISOString().split('T')[0],
    status: 'In Draft',
    type: 'Grant',
    amount: 0,
    checkedWithDCEO: false,
    accountsSent: false,
    receivedIntoBank: false,
    releasedIntoPL: false,
    startDate: '',
    endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Bid);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2>{initialData ? 'Edit Bid Details' : 'Log New Funding Bid'}</h2>
        <p>Complete the fields below to track the application lifecycle.</p>
      </div>

      <div className={styles.scrollableBody}>
        {/* SECTION 1: ADMINISTRATION */}
        <div className={styles.section}>
          <h3>1. Administration & Compliance</h3>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Date of Submission</label>
              <input type="date" name="submissionDate" value={formData.submissionDate} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label>Brief Author</label>
              <input type="text" name="briefAuthor" value={formData.briefAuthor} onChange={handleChange} placeholder="e.g. Ian Birch" required />
            </div>
            <div className={styles.field}>
              <label>Bid Checker</label>
              <input type="text" name="bidChecker" value={formData.bidChecker} onChange={handleChange} placeholder="Secondary Reviewer" />
            </div>
            <div className={styles.checkboxField}>
              <input type="checkbox" name="checkedWithDCEO" checked={formData.checkedWithDCEO} onChange={handleChange} id="dceo" />
              <label htmlFor="dceo">Checked with DCEO?</label>
            </div>
          </div>
        </div>

        {/* SECTION 2: BID DETAILS */}
        <div className={styles.section}>
          <h3>2. Bid Specification</h3>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Fund Name / Application</label>
              <input type="text" name="fundName" value={formData.fundName} onChange={handleChange} placeholder="e.g. National Lottery Heritage" required />
            </div>
            <div className={styles.field}>
              <label>Grant, Trust or Tender</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {TypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Site / Location / Project</label>
              <input type="text" name="siteLocation" value={formData.siteLocation} onChange={handleChange} placeholder="e.g. YMCA Cambridge" />
            </div>
            <div className={styles.field}>
              <label>Theme</label>
              <input type="text" name="theme" value={formData.theme} onChange={handleChange} placeholder="e.g. Youth Services" />
            </div>
            <div className={styles.field}>
              <label>Source Tracker</label>
              <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. FundFinder" />
            </div>
          </div>
        </div>

        {/* SECTION 3: FINANCIALS */}
        <div className={styles.section}>
          <h3>3. Financial Monitoring</h3>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Bid Amount (£)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className={styles.checkboxRow}>
              <div className={styles.checkboxField}>
                <input type="checkbox" name="accountsSent" checked={formData.accountsSent} onChange={handleChange} id="accounts" />
                <label htmlFor="accounts">Accounts Sent</label>
              </div>
              <div className={styles.checkboxField}>
                <input type="checkbox" name="receivedIntoBank" checked={formData.receivedIntoBank} onChange={handleChange} id="bank" />
                <label htmlFor="bank">Received in Bank</label>
              </div>
              <div className={styles.checkboxField}>
                <input type="checkbox" name="releasedIntoPL" checked={formData.releasedIntoPL} onChange={handleChange} id="pl" />
                <label htmlFor="pl">P&L Released</label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: OPS & STATUS */}
        <div className={styles.section}>
          <h3>4. Status & Outcomes</h3>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Implementation Leader</label>
              <input type="text" name="projectLead" value={formData.projectLead} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Current Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                {StatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Project Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Project End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
            <div className={`${styles.field} ${styles.fullSpan}`}>
              <label>Reporting Requirements</label>
              <textarea name="reportingRequirements" value={formData.reportingRequirements} onChange={handleChange} rows={2} />
            </div>
            <div className={`${styles.field} ${styles.fullSpan}`}>
              <label>Notes & Feedback</label>
              <textarea name="notesFeedback" value={formData.notesFeedback} onChange={handleChange} rows={3} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formFooter}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">
          {initialData ? 'Update Bid' : 'Confirm & Save Bid'}
        </button>
      </div>
    </form>
  );
};
