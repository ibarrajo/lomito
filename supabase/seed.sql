-- Lomito Local Development Seed Data
-- Run this via: supabase db reset (which runs migrations + seed)
-- or: supabase db seed

-- =============================================================================
-- 1. Test Users (auth + profiles)
-- =============================================================================

-- Create test auth user (password: password123)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'dev@lomito.org',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dev User"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- Create profile for test user
INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dev User',
  '+526641234567',
  'Tijuana',
  'admin'
);

-- =============================================================================
-- 2. Tijuana Jurisdiction
-- =============================================================================

-- Insert Tijuana municipality with approximate boundary polygon
-- Covers the main urban area from Playas de Tijuana to Otay
INSERT INTO jurisdictions (
  id,
  name,
  level,
  geometry,
  authority_name,
  authority_email,
  authority_phone,
  authority_url,
  escalation_enabled,
  verified
)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Tijuana',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-117.12 32.43, -117.12 32.55, -116.90 32.55, -116.90 32.43, -117.12 32.43)))', 4326),
  'Dirección de Bienestar Animal',
  'bienestar.animal@tijuana.gob.mx',
  '+526646888800',
  'https://www.tijuana.gob.mx/bienestar-animal',
  true,
  true
);

-- =============================================================================
-- 3. 25 Test Cases (realistic distribution across Tijuana neighborhoods)
-- =============================================================================

-- Case 1: Stray dog - Zona Centro - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'dog',
  'Stray dog with injured leg spotted near the market on Avenida Revolución. Appears to be limping and in pain.',
  ST_SetSRID(ST_MakePoint(-117.0195, 32.5270), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'pending',
  now() - interval '2 days',
  now() - interval '2 days'
);

-- Case 2: Abuse - Playas de Tijuana - verified
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'dog',
  'Possible animal abuse reported - dog chained outside without shelter or water. Neighbors report constant barking and distress.',
  ST_SetSRID(ST_MakePoint(-117.1232, 32.5218), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'verified',
  now() - interval '5 days',
  now() - interval '4 days'
);

-- Case 3: Missing cat - Zona Río - in_progress
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'cat',
  'Missing tabby cat, last seen near Parque Morelos. Orange and white stripes, wearing blue collar with bell.',
  ST_SetSRID(ST_MakePoint(-117.0102, 32.5172), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'in_progress',
  now() - interval '7 days',
  now() - interval '6 days'
);

-- Case 4: Stray - Otay - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'dog',
  'Pack of 3 stray dogs roaming near elementary school. They appear friendly but may pose safety concerns for children.',
  ST_SetSRID(ST_MakePoint(-116.9602, 32.5448), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'pending',
  now() - interval '3 days',
  now() - interval '3 days'
);

-- Case 5: Abuse - La Mesa - resolved
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'cat',
  'Cat stuck on rooftop for 2 days, owner cannot reach. Appears dehydrated and distressed.',
  ST_SetSRID(ST_MakePoint(-116.9498, 32.5102), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'resolved',
  now() - interval '15 days',
  now() - interval '10 days'
);

-- Case 6: Stray - Zona Norte - verified
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'dog',
  'Injured stray dog hiding under parked cars. Has visible wounds and is very scared of people.',
  ST_SetSRID(ST_MakePoint(-117.0228, 32.5352), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'verified',
  now() - interval '4 days',
  now() - interval '3 days'
);

-- Case 7: Missing - Colonia Libertad - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'dog',
  'Small white chihuahua missing since yesterday. Wearing pink harness, very friendly and responds to "Luna".',
  ST_SetSRID(ST_MakePoint(-117.0082, 32.5318), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'pending',
  now() - interval '1 day',
  now() - interval '1 day'
);

-- Case 8: Abuse - Hipódromo - in_progress
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'dog',
  'Dog left in hot car in parking lot. Windows barely cracked, dog appears to be panting heavily.',
  ST_SetSRID(ST_MakePoint(-117.0252, 32.5088), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  now() - interval '6 hours',
  now() - interval '5 hours'
);

-- Case 9: Stray - Chapultepec - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'cat',
  'Multiple stray cats living in abandoned building. Appear malnourished and some look sick.',
  ST_SetSRID(ST_MakePoint(-117.0348, 32.5152), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'pending',
  now() - interval '8 days',
  now() - interval '8 days'
);

-- Case 10: Missing - Cacho - resolved
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'cat',
  'Black cat with white paws missing. Last seen in the neighborhood, very shy but microchipped.',
  ST_SetSRID(ST_MakePoint(-117.0178, 32.5082), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'low',
  'resolved',
  now() - interval '20 days',
  now() - interval '12 days'
);

-- Case 11: Stray - Sánchez Taboada - verified
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'dog',
  'Pregnant stray dog seeking shelter near construction site. Needs immediate rescue before giving birth.',
  ST_SetSRID(ST_MakePoint(-116.9798, 32.4902), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'verified',
  now() - interval '9 days',
  now() - interval '8 days'
);

-- Case 12: Abuse - Francisco Villa - in_progress
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'bird',
  'Parrots in very small cage, appears to be illegal wildlife trafficking. Birds look distressed and malnourished.',
  ST_SetSRID(ST_MakePoint(-116.9702, 32.4798), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'in_progress',
  now() - interval '11 days',
  now() - interval '10 days'
);

-- Case 13: Missing - El Florido - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000013',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'dog',
  'Golden retriever escaped from yard during storm. Very friendly, wearing red collar with contact info.',
  ST_SetSRID(ST_MakePoint(-116.9198, 32.4702), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'pending',
  now() - interval '12 hours',
  now() - interval '12 hours'
);

-- Case 14: Stray - Zona Centro - resolved
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'cat',
  'Kitten found abandoned in cardboard box near metro station. Very young, needs immediate care.',
  ST_SetSRID(ST_MakePoint(-117.0188, 32.5265), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'resolved',
  now() - interval '18 days',
  now() - interval '16 days'
);

-- Case 15: Abuse - Playas de Tijuana - verified
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000015',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'dog',
  'Dog being kept in extremely unsanitary conditions. Feces everywhere, no clean water visible.',
  ST_SetSRID(ST_MakePoint(-117.1225, 32.5215), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'verified',
  now() - interval '6 days',
  now() - interval '5 days'
);

-- Case 16: Missing - Zona Río - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000016',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'cat',
  'Siamese cat missing from apartment building. Indoor cat that escaped through window.',
  ST_SetSRID(ST_MakePoint(-117.0095, 32.5168), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'low',
  'pending',
  now() - interval '4 days',
  now() - interval '4 days'
);

-- Case 17: Stray - Otay - in_progress
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000017',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'dog',
  'Elderly dog wandering busy street, appears disoriented and at risk of being hit by traffic.',
  ST_SetSRID(ST_MakePoint(-116.9595, 32.5455), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  now() - interval '14 hours',
  now() - interval '13 hours'
);

-- Case 18: Abuse - La Mesa - verified
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000018',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'other',
  'Rabbit being kept in tiny cage outdoors with no shade. Temperature extremely high, animal showing signs of heat stress.',
  ST_SetSRID(ST_MakePoint(-116.9505, 32.5095), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'verified',
  now() - interval '10 days',
  now() - interval '9 days'
);

-- Case 19: Missing - Zona Norte - resolved
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'dog',
  'Beagle escaped during walk, slipped out of collar. Very food motivated and friendly with people.',
  ST_SetSRID(ST_MakePoint(-117.0235, 32.5345), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'resolved',
  now() - interval '25 days',
  now() - interval '22 days'
);

-- Case 20: Stray - Colonia Libertad - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'cat',
  'Injured cat with damaged eye spotted in alley. Needs veterinary attention urgently.',
  ST_SetSRID(ST_MakePoint(-117.0075, 32.5325), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'pending',
  now() - interval '1 day',
  now() - interval '1 day'
);

-- Case 21: Abuse - Hipódromo - in_progress
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'dog',
  'Dog being used for fighting training. Multiple scars visible, very aggressive behavior indicating abuse.',
  ST_SetSRID(ST_MakePoint(-117.0245, 32.5092), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  now() - interval '13 days',
  now() - interval '12 days'
);

-- Case 22: Missing - Chapultepec - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000022',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'bird',
  'Pet cockatiel escaped through open door. Grey and yellow feathers, responds to whistling.',
  ST_SetSRID(ST_MakePoint(-117.0355, 32.5148), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'low',
  'pending',
  now() - interval '3 days',
  now() - interval '3 days'
);

-- Case 23: Stray - Cacho - resolved
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'stray',
  'dog',
  'Stray puppy found near dumpster, approximately 2-3 months old. Needs food and shelter urgently.',
  ST_SetSRID(ST_MakePoint(-117.0172, 32.5078), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'resolved',
  now() - interval '28 days',
  now() - interval '25 days'
);

-- Case 24: Abuse - Sánchez Taboada - in_progress
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000024',
  '00000000-0000-0000-0000-000000000001',
  'abuse',
  'cat',
  'Multiple cats being hoarded in residence. Strong odor, animals appear sick and malnourished.',
  ST_SetSRID(ST_MakePoint(-116.9805, 32.4898), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'in_progress',
  now() - interval '17 days',
  now() - interval '16 days'
);

-- Case 25: Missing - Francisco Villa - pending
INSERT INTO cases (
  id,
  reporter_id,
  category,
  animal_type,
  description,
  location,
  jurisdiction_id,
  urgency,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000025',
  '00000000-0000-0000-0000-000000000001',
  'missing',
  'dog',
  'Husky mix missing since this morning. Blue eyes, grey and white fur, very vocal.',
  ST_SetSRID(ST_MakePoint(-116.9695, 32.4805), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'pending',
  now() - interval '8 hours',
  now() - interval '8 hours'
);

-- =============================================================================
-- 4. Timeline Entries
-- =============================================================================

-- Note: Each case automatically gets a 'created' timeline entry via trigger
-- We only need to manually add additional timeline entries for verified/in_progress/resolved cases

-- Case 2: Abuse - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Location confirmed, forwarding to authorities"}'::jsonb,
  now() - interval '4 days'
);

-- Case 3: Missing cat - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Owner information verified"}'::jsonb,
  now() - interval '6 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Local volunteer searching neighborhood"}'::jsonb,
  now() - interval '5 days 12 hours'
);

-- Case 5: Abuse - verified, in_progress, then resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Emergency rescue needed"}'::jsonb,
  now() - interval '14 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Fire department contacted for rooftop rescue"}'::jsonb,
  now() - interval '13 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "in_progress", "to": "resolved", "notes": "Cat safely rescued and returned to owner"}'::jsonb,
  now() - interval '10 days'
);

-- Case 6: Stray - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Critical condition confirmed, rescue team dispatched"}'::jsonb,
  now() - interval '3 days'
);

-- Case 8: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Police notified, immediate response required"}'::jsonb,
  now() - interval '5 hours 30 minutes'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Police on scene"}'::jsonb,
  now() - interval '5 hours'
);

-- Case 10: Missing - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Microchip information verified"}'::jsonb,
  now() - interval '19 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Cat spotted two blocks away"}'::jsonb,
  now() - interval '15 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "in_progress", "to": "resolved", "notes": "Cat safely recovered and returned home"}'::jsonb,
  now() - interval '12 days'
);

-- Case 11: Stray - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Pregnant dog confirmed, emergency shelter arranged"}'::jsonb,
  now() - interval '8 days'
);

-- Case 12: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Wildlife authorities contacted"}'::jsonb,
  now() - interval '10 days 12 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "PROFEPA investigating"}'::jsonb,
  now() - interval '10 days'
);

-- Case 14: Stray - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Kitten needs immediate veterinary care"}'::jsonb,
  now() - interval '17 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Kitten picked up by volunteer, en route to vet"}'::jsonb,
  now() - interval '16 days 18 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "in_progress", "to": "resolved", "notes": "Kitten healthy and placed in foster home"}'::jsonb,
  now() - interval '16 days'
);

-- Case 15: Abuse - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000015',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Severe neglect confirmed, animal control notified"}'::jsonb,
  now() - interval '5 days'
);

-- Case 17: Stray - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000017',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Elderly dog in traffic confirmed, urgent rescue needed"}'::jsonb,
  now() - interval '13 hours 30 minutes'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000017',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Volunteer on location attempting safe capture"}'::jsonb,
  now() - interval '13 hours'
);

-- Case 18: Abuse - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000018',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Heat stress confirmed, animal welfare check scheduled"}'::jsonb,
  now() - interval '9 days'
);

-- Case 19: Missing - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Owner information verified, search area identified"}'::jsonb,
  now() - interval '24 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Beagle sighted near taco stand, volunteers searching"}'::jsonb,
  now() - interval '23 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "in_progress", "to": "resolved", "notes": "Beagle caught with treats and returned to owner"}'::jsonb,
  now() - interval '22 days'
);

-- Case 21: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Fighting training confirmed, authorities alerted"}'::jsonb,
  now() - interval '12 days 12 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Criminal investigation underway"}'::jsonb,
  now() - interval '12 days'
);

-- Case 23: Stray - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Puppy condition assessed, needs immediate care"}'::jsonb,
  now() - interval '27 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Puppy taken to vet for checkup"}'::jsonb,
  now() - interval '26 days'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "in_progress", "to": "resolved", "notes": "Puppy healthy, vaccinated, and adopted"}'::jsonb,
  now() - interval '25 days'
);

-- Case 24: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000024',
  '00000000-0000-0000-0000-000000000001',
  'verified',
  '{"notes": "Hoarding situation confirmed, health hazard"}'::jsonb,
  now() - interval '16 days 12 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000024',
  '00000000-0000-0000-0000-000000000001',
  'status_changed',
  '{"from": "verified", "to": "in_progress", "notes": "Animal control working with owner on rehoming plan"}'::jsonb,
  now() - interval '16 days'
);

-- Add some comment timeline entries across various cases
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'comment',
  '{"text": "Neighbor confirmed dog has been in same spot for weeks without proper care"}'::jsonb,
  now() - interval '4 days 12 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'comment',
  '{"text": "Dog is very scared but accepted food from volunteer"}'::jsonb,
  now() - interval '3 days 6 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'comment',
  '{"text": "Setting up safe space with blankets and food for the mama dog"}'::jsonb,
  now() - interval '8 days 12 hours'
);

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at)
VALUES (
  '00000000-0000-0000-0001-000000000015',
  '00000000-0000-0000-0000-000000000001',
  'comment',
  '{"text": "Owner has been notified and given 48 hours to improve conditions"}'::jsonb,
  now() - interval '5 days 6 hours'
);
