// Hand-written domain types for the Lomito client. The Supabase Database
// shape is auto-generated in ./database-generated.ts and re-exported below.
// Run: `npx supabase gen types typescript --linked > packages/shared/src/types/database-generated.ts`

import type { Json } from './database-generated';

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
  details: Json | null;
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

// Re-export the auto-generated Supabase Database and Json types. Run
// `npx supabase gen types typescript --linked > database-generated.ts`
// to refresh after migrations.
export type { Database, Json } from './database-generated';
