export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type EntryType = 'NEED' | 'OFFER'; // NEED = Need help/supplies, OFFER = Can provide
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ReliefEntry {
  id: string;
  type: EntryType;
  category: string; // e.g., "Food", "Medical", "Shelter", "Transport"
  item: string;
  quantity: string;
  location: string;
  contactInfo: string;
  urgency: UrgencyLevel;
  status: Status;
  timestamp: number;
  originalMessage: string; // Keep source for verification
  notes?: string; // Additional remarks
}

export interface Stats {
  totalNeeds: number;
  totalOffers: number;
  completed: number;
  highUrgency: number;
}

export interface Contact {
  name: string;
  phone: string;
  note?: string;
}

export interface LocationStatus {
  id: string; // Added for editable state
  location_name: string;
  contacts: Contact[];
  current_status: string;
  needs_support: boolean | string | null;
  needed_items?: string[];
}