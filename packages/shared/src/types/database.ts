// Manual database types — will be replaced by auto-generated types from Supabase CLI
// Run: supabase gen types typescript --local > packages/shared/src/types/database.ts

export type UserRole = 'citizen' | 'moderator' | 'government' | 'admin';
export type CaseStatus =
  | 'pending'
  | 'verified'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'archived';
export type CaseCategory =
  | 'abuse'
  | 'stray'
  | 'missing'
  | 'injured'
  | 'zoonotic'
  | 'dead_animal'
  | 'dangerous_dog'
  | 'distress'
  | 'illegal_sales'
  | 'wildlife'
  | 'noise_nuisance';
export type AnimalType = 'dog' | 'cat' | 'bird' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type MediaType = 'image' | 'video';
export type JurisdictionLevel =
  | 'country'
  | 'state'
  | 'municipality'
  | 'delegacion'
  | 'locality';
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
  | 'archived'
  | 'marked_unresponsive';

export type AuthorityType =
  | 'primary'
  | 'escalation'
  | 'enforcement'
  | 'specialized';
export type DependencyCategory =
  | 'control_animal'
  | 'ecologia'
  | 'salud'
  | 'seguridad_publica'
  | 'fiscalia'
  | 'dif'
  | 'semarnat'
  | 'smads'
  | 'unknown';
export type VerificationStatus =
  | 'unverified'
  | 'verified'
  | 'contact_confirmed'
  | 'unresponsive';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type PoiType = 'government_office' | 'animal_shelter' | 'vet_clinic';
export type VetSubtype = 'standard' | 'emergency' | 'hours_24';

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  own_case_updates: boolean;
  flagged_cases: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  municipality: string | null;
  role: UserRole;
  avatar_url: string | null;
  push_token: string | null;
  notification_preferences: NotificationPreferences | null;
  created_at: string;
  updated_at: string;
}

export interface Jurisdiction {
  id: string;
  name: string;
  name_en: string | null;
  parent_id: string | null;
  level: JurisdictionLevel;
  country_code: string;
  inegi_clave: string | null;
  fips_code: string | null;
  population: number | null;
  timezone: string | null;
  /** @deprecated Use jurisdiction_authorities table instead */
  authority_name: string | null;
  /** @deprecated Use jurisdiction_authorities table instead */
  authority_email: string | null;
  /** @deprecated Use jurisdiction_authorities table instead */
  authority_phone: string | null;
  /** @deprecated Use jurisdiction_authorities table instead */
  authority_url: string | null;
  escalation_enabled: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface JurisdictionAuthority {
  id: string;
  jurisdiction_id: string;
  authority_type: AuthorityType;
  dependency_category: DependencyCategory;
  dependency_name: string;
  department_name: string | null;
  contact_name: string | null;
  contact_title: string | null;
  email: string | null;
  phone: string | null;
  url: string | null;
  address: string | null;
  handles_report_types: string[];
  verification: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthoritySubmission {
  id: string;
  jurisdiction_id: string;
  submitted_by: string;
  status: SubmissionStatus;
  dependency_name: string;
  department_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  url: string | null;
  handles_report_types: string[];
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Case {
  id: string;
  reporter_id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  location: { type: 'Point'; coordinates: [number, number] };
  location_notes: string | null;
  jurisdiction_id: string | null;
  urgency: UrgencyLevel;
  status: CaseStatus;
  flag_count: number;
  folio: string | null;
  escalated_at: string | null;
  escalation_email_id: string | null;
  escalation_reminder_count: number;
  marked_unresponsive: boolean;
  government_response_at: string | null;
  incident_at: string | null;
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
  status: string;
  payment_url: string | null;
  created_at: string;
}

export interface CaseComment {
  id: string;
  case_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface CaseFlag {
  id: string;
  case_id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
}

export interface InboundEmail {
  id: string;
  case_id: string;
  from_email: string;
  subject: string | null;
  body_text: string;
  received_at: string;
}

export interface PointOfInterest {
  id: string;
  poi_type: PoiType;
  vet_subtype: VetSubtype | null;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  url: string | null;
  hours: string | null;
  capacity: number | null;
  lng: number;
  lat: number;
  jurisdiction_id: string | null;
}

// Supabase Database type for client typing
export interface Database {
  public: {
    Views: Record<string, never>;
    Tables: {
      profiles: {
        Row: Profile & Record<string, unknown>;
        Insert: Omit<
          Profile,
          'created_at' | 'updated_at' | 'notification_preferences'
        > & {
          created_at?: string;
          updated_at?: string;
          notification_preferences?: NotificationPreferences | null;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      jurisdictions: {
        Row: Jurisdiction & Record<string, unknown>;
        Insert: Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Jurisdiction, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      jurisdiction_authorities: {
        Row: JurisdictionAuthority & Record<string, unknown>;
        Insert: Omit<
          JurisdictionAuthority,
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<JurisdictionAuthority, 'id' | 'created_at' | 'updated_at'>
        >;
        Relationships: [];
      };
      authority_submissions: {
        Row: AuthoritySubmission & Record<string, unknown>;
        Insert: Omit<AuthoritySubmission, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<AuthoritySubmission, 'id' | 'submitted_by' | 'created_at'>
        >;
        Relationships: [];
      };
      cases: {
        Row: Case & Record<string, unknown>;
        Insert: Omit<
          Case,
          | 'id'
          | 'location_notes'
          | 'jurisdiction_id'
          | 'status'
          | 'flag_count'
          | 'folio'
          | 'escalated_at'
          | 'escalation_email_id'
          | 'escalation_reminder_count'
          | 'marked_unresponsive'
          | 'government_response_at'
          | 'incident_at'
          | 'created_at'
          | 'updated_at'
        > & {
          id?: string;
          location_notes?: string | null;
          jurisdiction_id?: string | null;
          status?: CaseStatus;
          flag_count?: number;
          folio?: string | null;
          escalated_at?: string | null;
          escalation_email_id?: string | null;
          escalation_reminder_count?: number;
          marked_unresponsive?: boolean;
          government_response_at?: string | null;
          incident_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: CaseCategory;
          animal_type?: AnimalType;
          description?: string;
          location?: { type: 'Point'; coordinates: [number, number] };
          location_notes?: string | null;
          jurisdiction_id?: string | null;
          urgency?: UrgencyLevel;
          status?: CaseStatus;
          flag_count?: number;
          folio?: string | null;
          escalated_at?: string | null;
          escalation_email_id?: string | null;
          escalation_reminder_count?: number;
          marked_unresponsive?: boolean;
          government_response_at?: string | null;
          incident_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      case_media: {
        Row: CaseMedia & Record<string, unknown>;
        Insert: Omit<CaseMedia, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CaseMedia, 'id' | 'case_id' | 'created_at'>>;
        Relationships: [];
      };
      case_timeline: {
        Row: CaseTimeline & Record<string, unknown>;
        Insert: {
          case_id: string;
          actor_id: string | null;
          action: TimelineAction;
          details?: Record<string, unknown>;
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      case_subscriptions: {
        Row: CaseSubscription & Record<string, unknown>;
        Insert: Omit<CaseSubscription, 'created_at'> & { created_at?: string };
        Update: never;
        Relationships: [];
      };
      donations: {
        Row: Donation & Record<string, unknown>;
        Insert: Omit<
          Donation,
          'id' | 'created_at' | 'status' | 'payment_url'
        > & {
          id?: string;
          created_at?: string;
          status?: string;
          payment_url?: string | null;
        };
        Update: Partial<Omit<Donation, 'id' | 'created_at'>>;
        Relationships: [];
      };
      case_comments: {
        Row: CaseComment & Record<string, unknown>;
        Insert: Omit<CaseComment, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      case_flags: {
        Row: CaseFlag & Record<string, unknown>;
        Insert: Omit<CaseFlag, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      inbound_emails: {
        Row: InboundEmail & Record<string, unknown>;
        Insert: Omit<InboundEmail, 'id' | 'received_at'> & {
          id?: string;
          received_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      points_of_interest: {
        Row: PointOfInterest & {
          location: unknown;
          verified: boolean;
          created_at: string;
          updated_at: string;
        } & Record<string, unknown>;
        Insert: Omit<PointOfInterest, 'id' | 'lng' | 'lat'> & {
          id?: string;
          location: unknown;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PointOfInterest, 'id' | 'lng' | 'lat'>> & {
          location?: unknown;
          verified?: boolean;
          updated_at?: string;
        };
        Relationships: [];
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
      authority_type: AuthorityType;
      dependency_category: DependencyCategory;
      verification_status: VerificationStatus;
      submission_status: SubmissionStatus;
      poi_type: PoiType;
      vet_subtype: VetSubtype;
    };
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          total_cases: number;
          resolved_cases: number;
          pending_cases: number;
          in_progress_cases: number;
          abuse_cases: number;
          stray_cases: number;
          missing_cases: number;
          total_donations: number;
          avg_resolution_days: number;
        };
      };
      get_pois_in_bounds: {
        Args: {
          p_west: number;
          p_south: number;
          p_east: number;
          p_north: number;
          p_types: string[];
        };
        Returns: PointOfInterest[];
      };
    };
  };
}
