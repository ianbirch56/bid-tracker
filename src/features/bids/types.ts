export type BidStatus = 'In Draft' | 'Submitted' | 'Successful' | 'Unsuccessful';

export interface Bid {
  id?: string;
  // Submission Info
  submissionDate: string;
  briefAuthor: string;
  bidChecker: string;
  checkedWithDCEO: boolean;
  
  // Bid Details
  fundName: string;
  type: 'Grant' | 'Trust' | 'Tender';
  siteLocation: string;
  theme: string;
  source: string;
  
  // Financials
  amount: number;
  accountsSent: boolean;
  receivedIntoBank: boolean;
  releasedIntoPL: boolean;
  
  // Operations & Status
  status: BidStatus;
  projectLead: string;
  startDate: string;
  endDate: string;
  reportingRequirements: string;
  notesFeedback: string;
}

export const StatusOptions: BidStatus[] = ['In Draft', 'Submitted', 'Successful', 'Unsuccessful'];
export const TypeOptions: Bid['type'][] = ['Grant', 'Trust', 'Tender'];
