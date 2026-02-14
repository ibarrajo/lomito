// Manual database types — will be replaced by auto-generated types from Supabase CLI
// Run: supabase gen types typescript --local > packages/shared/src/types/database.ts

export type UserRole = 'citizen' | 'moderator' | 'government' | 'admin';
export type CaseStatus = 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected' | 'archived';
export type CaseCategory = 'abuse' | 'stray' | 'missing';
export type AnimalType = 'dog' | 'cat' | 'bird' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type MediaType = 'image' | 'video';
export type JurisdictionLevel = 'state' | 'municipality' | 'locality';
export type DonationMethod = 'mercado_pago' | 'stripe' | 'oxxo' | 'spei';
export type TimelineAction =
  | 'created'
  | 'verified'
  | 'rejected'
  | 'status_changed'
  | 'assigned'
  | 'escalated'
  | 'government_response'
  | 'comment'
  | 'media_added'
  | 'flagged'
  | 'resolved'
  | 'archived';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  municipality: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  parent_id: string | null;
  level: JurisdictionLevel;
  authority_name: string | null;
  authority_email: string | null;
  authority_phone: string | null;
  authority_url: string | null;
  escalation_enabled: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  reporter_id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  location: { type: 'Point'; coordinates: [number, number] };
  jurisdiction_id: string | null;
  urgency: UrgencyLevel;
  status: CaseStatus;
  flag_count: number;
  folio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseMedia {
  id: string;
  case_id: string;
  url: string;
  type: MediaType;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface CaseTimeline {
  id: string;
  case_id: string;
  actor_id: string | null;
  action: TimelineAction;
  details: Record<string, unknown>;
  created_at: string;
}

export interface CaseSubscription {
  user_id: string;
  case_id: string;
  created_at: string;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  method: DonationMethod;
  donor_id: string | null;
  recurring: boolean;
  external_id: string | null;
  created_at: string;
}

// Supabase Database type for client typing
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      jurisdictions: {
        Row: Jurisdiction;
        Insert: Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'>>;
      };
      cases: {
        Row: Case;
        Insert: Omit<Case, 'id' | 'jurisdiction_id' | 'status' | 'flag_count' | 'folio' | 'created_at' | 'updated_at'> & {
          id?: string;
          jurisdiction_id?: string | null;
          status?: CaseStatus;
          flag_count?: number;
          folio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Case, 'id' | 'reporter_id' | 'created_at' | 'updated_at'>>;
      };
      case_media: {
        Row: CaseMedia;
        Insert: Omit<CaseMedia, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CaseMedia, 'id' | 'case_id' | 'created_at'>>;
      };
      case_timeline: {
        Row: CaseTimeline;
        Insert: Omit<CaseTimeline, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
      case_subscriptions: {
        Row: CaseSubscription;
        Insert: Omit<CaseSubscription, 'created_at'> & { created_at?: string };
        Update: never;
      };
      donations: {
        Row: Donation;
        Insert: Omit<Donation, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Donation, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      user_role: UserRole;
      case_status: CaseStatus;
      case_category: CaseCategory;
      animal_type: AnimalType;
      urgency_level: UrgencyLevel;
      media_type: MediaType;
      jurisdiction_level: JurisdictionLevel;
      donation_method: DonationMethod;
      timeline_action: TimelineAction;
    };
  };
}
