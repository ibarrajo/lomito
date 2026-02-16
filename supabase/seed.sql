-- Lomito Local Development Seed Data
-- Run this via: supabase db reset (which runs migrations + seed)
-- or: supabase db seed

-- =============================================================================
-- 1. (Removed — 'injured' and other categories added via migration 20250215000002)
-- =============================================================================

-- =============================================================================
-- 2. Test Users (6 users: admin, 2 citizens, 1 moderator, 1 government, 1 citizen in Rosarito)
-- =============================================================================

-- User 1: Dev Admin
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
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  reauthentication_token
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
  '{"full_name":"Dev Admin"}'::jsonb,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"dev@lomito.org"}'::jsonb,
  'email',
  '00000000-0000-0000-0000-000000000001',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dev Admin',
  '+526641234567',
  'Tijuana',
  'admin'
);

-- User 2: María García López (citizen, Tijuana)
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
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'maria@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"María García López"}'::jsonb,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub":"00000000-0000-0000-0000-000000000002","email":"maria@example.com"}'::jsonb,
  'email',
  '00000000-0000-0000-0000-000000000002',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'María García López',
  '+526642345678',
  'Tijuana',
  'citizen'
);

-- User 3: Carlos Mendoza Ruiz (citizen, Tijuana)
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
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'carlos@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Carlos Mendoza Ruiz"}'::jsonb,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '{"sub":"00000000-0000-0000-0000-000000000003","email":"carlos@example.com"}'::jsonb,
  'email',
  '00000000-0000-0000-0000-000000000003',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Carlos Mendoza Ruiz',
  '+526643456789',
  'Tijuana',
  'citizen'
);

-- User 4: Ana Rodríguez Vega (moderator, Tijuana)
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
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'mod@lomito.org',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Ana Rodríguez Vega"}'::jsonb,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  '{"sub":"00000000-0000-0000-0000-000000000004","email":"mod@lomito.org"}'::jsonb,
  'email',
  '00000000-0000-0000-0000-000000000004',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Ana Rodríguez Vega',
  '+526644567890',
  'Tijuana',
  'moderator'
);

-- User 5: Roberto Sánchez Díaz (government, Tijuana)
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
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'gov@lomito.org',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Roberto Sánchez Díaz"}'::jsonb,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005',
  '{"sub":"00000000-0000-0000-0000-000000000005","email":"gov@lomito.org"}'::jsonb,
  'email',
  '00000000-0000-0000-0000-000000000005',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Roberto Sánchez Díaz',
  '+526645678901',
  'Tijuana',
  'government'
);

-- User 6: Laura Torres Mora (citizen, Playas de Rosarito)
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
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  reauthentication_token
)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'laura@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Laura Torres Mora"}'::jsonb,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '',
  '',
  ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000006',
  '{"sub":"00000000-0000-0000-0000-000000000006","email":"laura@example.com"}'::jsonb,
  'email',
  '00000000-0000-0000-0000-000000000006',
  now(),
  now(),
  now()
);

INSERT INTO profiles (id, full_name, phone, municipality, role)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'Laura Torres Mora',
  '+526646789012',
  'Playas de Rosarito',
  'citizen'
);

-- =============================================================================
-- 3. Jurisdictions (Mexico → BC → 7 municipalities → delegaciones)
--    Approximate polygons based on INEGI Marco Geoestadístico boundaries
--    Full INEGI import requires ogr2ogr (GDAL) + shapefile download
-- =============================================================================

-- Mexico (country-level, no geometry)
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  country_code, inegi_clave, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  'México', 'Mexico', NULL, 'country',
  'MX', '00', 'America/Mexico_City',
  false, true
);

-- Baja California (state)
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'Baja California', 'Baja California',
  '00000000-0000-0000-0000-000000000100',
  'state',
  ST_GeomFromText('MULTIPOLYGON(((-117.13 32.54, -117.10 32.52, -117.09 32.46, -117.06 32.40, -117.05 32.33, -117.05 32.24, -117.04 32.16, -117.02 32.08, -116.97 32.00, -116.90 31.90, -116.82 31.78, -116.75 31.70, -116.67 31.58, -116.60 31.50, -116.52 31.40, -116.47 31.28, -116.42 31.15, -116.38 31.00, -116.35 30.85, -116.30 30.70, -116.25 30.55, -116.18 30.38, -116.10 30.20, -116.02 30.05, -115.93 29.90, -115.85 29.72, -115.75 29.55, -115.68 29.40, -115.60 29.20, -115.52 29.05, -115.42 28.85, -115.30 28.70, -115.18 28.60, -115.05 28.50, -114.95 28.42, -114.85 28.38, -114.75 28.40, -114.60 28.50, -114.50 28.70, -114.40 28.95, -114.35 29.20, -114.32 29.50, -114.50 29.80, -114.65 30.05, -114.72 30.30, -114.72 30.55, -114.72 30.80, -114.72 31.05, -114.72 31.30, -114.72 31.55, -114.72 31.80, -114.72 32.00, -114.72 32.20, -114.72 32.52, -114.75 32.58, -114.82 32.62, -115.00 32.66, -115.20 32.69, -115.40 32.70, -115.60 32.71, -115.80 32.71, -116.00 32.71, -116.20 32.71, -116.40 32.71, -116.60 32.67, -116.75 32.62, -116.85 32.58, -116.95 32.55, -117.05 32.54, -117.13 32.54)))', 4326),
  'MX', '02', 3769020, 'America/Tijuana',
  true, true
);

-- Tijuana municipality (02004) — keeps existing ID
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  authority_name, authority_email, authority_phone, authority_url,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Tijuana', 'Tijuana',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-117.13 32.54, -117.10 32.52, -117.09 32.49, -117.08 32.46, -117.06 32.44, -117.05 32.42, -116.98 32.42, -116.92 32.42, -116.88 32.44, -116.85 32.47, -116.85 32.50, -116.85 32.53, -116.85 32.55, -116.85 32.58, -116.90 32.60, -116.95 32.55, -117.00 32.54, -117.05 32.54, -117.13 32.54)))', 4326),
  'MX', '02004', 1922523, 'America/Tijuana',
  'Departamento de Control Animal', 'control.animal@tijuana.gob.mx',
  '+526646888800', 'https://www.tijuana.gob.mx',
  true, true
);

-- Playas de Rosarito municipality (02005) — keeps existing ID
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  authority_name, authority_email, authority_phone, authority_url,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  'Playas de Rosarito', 'Playas de Rosarito',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-117.06 32.42, -117.05 32.38, -117.04 32.35, -117.04 32.32, -117.04 32.29, -116.92 32.29, -116.88 32.30, -116.85 32.33, -116.85 32.36, -116.85 32.39, -116.85 32.42, -116.88 32.44, -116.92 32.42, -116.98 32.42, -117.06 32.42)))', 4326),
  'MX', '02005', 117000, 'America/Tijuana',
  'Departamento de Control Animal', 'control.animal@rosarito.gob.mx',
  '+526613612000', 'https://www.rosarito.gob.mx',
  true, true
);

-- Mexicali municipality (02002)
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'Mexicali', 'Mexicali',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-116.05 32.71, -115.80 32.71, -115.60 32.71, -115.40 32.70, -115.20 32.69, -115.00 32.66, -114.82 32.62, -114.75 32.58, -114.72 32.52, -114.72 32.20, -114.72 32.00, -114.75 31.85, -115.00 31.85, -115.20 31.85, -115.40 31.88, -115.60 31.95, -115.75 32.05, -115.85 32.15, -115.95 32.30, -116.00 32.42, -116.05 32.55, -116.05 32.71)))', 4326),
  'MX', '02002', 1049792, 'America/Tijuana',
  true, true
);

-- Ensenada municipality (02001) — largest in BC
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  'Ensenada', 'Ensenada',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-117.04 32.29, -117.02 32.22, -116.97 32.13, -116.92 32.05, -116.85 31.93, -116.78 31.82, -116.70 31.68, -116.62 31.55, -116.55 31.42, -116.48 31.30, -116.42 31.18, -116.37 31.05, -116.33 30.90, -116.30 30.78, -115.78 30.78, -115.40 30.82, -115.20 30.90, -115.00 31.05, -114.95 31.20, -114.95 31.45, -115.00 31.65, -115.15 31.78, -115.40 31.88, -115.60 31.95, -115.75 32.05, -115.85 32.15, -115.95 32.30, -116.00 32.42, -116.05 32.42, -116.20 32.42, -116.40 32.42, -116.60 32.35, -116.70 32.33, -116.78 32.30, -116.85 32.29, -116.92 32.29, -117.04 32.29)))', 4326),
  'MX', '02001', 443807, 'America/Tijuana',
  true, true
);

-- Tecate municipality (02003)
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  'Tecate', 'Tecate',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-116.85 32.58, -116.85 32.55, -116.85 32.50, -116.85 32.47, -116.85 32.44, -116.85 32.42, -116.85 32.39, -116.85 32.36, -116.85 32.33, -116.85 32.29, -116.78 32.30, -116.70 32.33, -116.60 32.35, -116.40 32.42, -116.20 32.42, -116.05 32.42, -116.05 32.55, -116.05 32.71, -116.20 32.71, -116.40 32.71, -116.60 32.67, -116.75 32.62, -116.85 32.58)))', 4326),
  'MX', '02003', 108440, 'America/Tijuana',
  true, true
);

-- San Quintín municipality (02006)
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000015',
  'San Quintín', 'San Quintin',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-116.30 30.78, -116.25 30.60, -116.18 30.42, -116.10 30.25, -116.02 30.08, -115.93 29.92, -115.85 29.75, -115.78 29.58, -115.40 29.58, -115.18 29.65, -115.05 29.80, -114.95 30.00, -114.95 30.20, -114.95 30.40, -114.95 30.60, -115.00 30.72, -115.00 31.05, -115.20 30.90, -115.40 30.82, -115.78 30.78, -116.30 30.78)))', 4326),
  'MX', '02006', 115562, 'America/Tijuana',
  false, true
);

-- San Felipe municipality (02007)
INSERT INTO jurisdictions (
  id, name, name_en, parent_id, level,
  geometry, country_code, inegi_clave, population, timezone,
  escalation_enabled, verified
)
VALUES (
  '00000000-0000-0000-0000-000000000016',
  'San Felipe', 'San Felipe',
  '00000000-0000-0000-0000-000000000020',
  'municipality',
  ST_GeomFromText('MULTIPOLYGON(((-115.78 29.58, -115.68 29.40, -115.55 29.22, -115.42 29.05, -115.30 28.85, -115.18 28.70, -115.05 28.58, -114.95 28.48, -114.85 28.42, -114.75 28.40, -114.60 28.50, -114.50 28.70, -114.40 28.95, -114.35 29.20, -114.32 29.50, -114.50 29.80, -114.65 30.05, -114.72 30.30, -114.72 30.55, -114.72 30.80, -114.72 31.05, -114.72 31.30, -114.72 31.55, -114.72 31.80, -114.72 32.00, -114.75 31.85, -115.00 31.85, -115.15 31.78, -115.00 31.65, -114.95 31.45, -114.95 31.20, -114.95 30.60, -114.95 30.40, -114.95 30.20, -114.95 30.00, -115.05 29.80, -115.18 29.65, -115.40 29.58, -115.78 29.58)))', 4326),
  'MX', '02007', 75000, 'America/Tijuana',
  false, true
);

-- =============================================================================
-- 3b. Delegaciones (Tijuana, Mexicali, Ensenada, San Quintín — no geometry)
-- =============================================================================

-- Tijuana delegaciones (9)
INSERT INTO jurisdictions (id, name, name_en, parent_id, level, country_code, inegi_clave, timezone, escalation_enabled, verified) VALUES
('00000000-0000-0000-00d1-000000000001', 'Centro', 'Downtown', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-01', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000002', 'La Mesa', 'La Mesa', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-02', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000003', 'Playas de Tijuana', 'Playas de Tijuana', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-03', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000004', 'San Antonio de los Buenos', 'San Antonio de los Buenos', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-04', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000005', 'La Presa', 'La Presa', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-05', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000006', 'Otay Centenario', 'Otay Centenario', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-06', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000007', 'Cerro Colorado', 'Cerro Colorado', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-07', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000008', 'La Presa Este', 'La Presa Este', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-08', 'America/Tijuana', false, true),
('00000000-0000-0000-00d1-000000000009', 'San Antonio del Mar', 'San Antonio del Mar', '00000000-0000-0000-0000-000000000010', 'delegacion', 'MX', '02004-09', 'America/Tijuana', false, true);

-- Mexicali delegaciones (14)
INSERT INTO jurisdictions (id, name, name_en, parent_id, level, country_code, inegi_clave, timezone, escalation_enabled, verified) VALUES
('00000000-0000-0000-00d2-000000000001', 'González Ortega', 'Gonzalez Ortega', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-01', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000002', 'Progreso', 'Progreso', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-02', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000003', 'Pueblo Nuevo', 'Pueblo Nuevo', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-03', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000004', 'Delta', 'Delta', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-04', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000005', 'Los Algodones', 'Los Algodones', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-05', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000006', 'Estación Coahuila', 'Estacion Coahuila', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-06', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000007', 'Benito Juárez', 'Benito Juarez', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-07', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000008', 'Compuertas', 'Compuertas', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-08', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000009', 'Hechicera', 'Hechicera', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-09', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000010', 'Venustiano Carranza', 'Venustiano Carranza', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-10', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000011', 'Estación Delta', 'Estacion Delta', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-11', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000012', 'Nuevo León', 'Nuevo Leon', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-12', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000013', 'Ciudad Morelos', 'Ciudad Morelos', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-13', 'America/Tijuana', false, true),
('00000000-0000-0000-00d2-000000000014', 'Guadalupe Victoria', 'Guadalupe Victoria', '00000000-0000-0000-0000-000000000012', 'delegacion', 'MX', '02002-14', 'America/Tijuana', false, true);

-- Ensenada delegaciones (16)
INSERT INTO jurisdictions (id, name, name_en, parent_id, level, country_code, inegi_clave, timezone, escalation_enabled, verified) VALUES
('00000000-0000-0000-00d3-000000000001', 'Ensenada Centro', 'Ensenada Downtown', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-01', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000002', 'El Sauzal', 'El Sauzal', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-02', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000003', 'Maneadero', 'Maneadero', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-03', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000004', 'Santo Tomás', 'Santo Tomas', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-04', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000005', 'San Vicente', 'San Vicente', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-05', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000006', 'Valle de la Trinidad', 'Valle de la Trinidad', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-06', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000007', 'Real del Castillo', 'Real del Castillo', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-07', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000008', 'Punta Colonet', 'Punta Colonet', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-08', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000009', 'Camalú', 'Camalu', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-09', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000010', 'Villa de Juárez', 'Villa de Juarez', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-10', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000011', 'El Rosario', 'El Rosario', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-11', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000012', 'San Antonio de las Minas', 'San Antonio de las Minas', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-12', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000013', 'Valle de Guadalupe', 'Valle de Guadalupe', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-13', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000014', 'La Misión', 'La Mision', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-14', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000015', 'Isla de Cedros', 'Isla de Cedros', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-15', 'America/Tijuana', false, true),
('00000000-0000-0000-00d3-000000000016', 'Punta Banda', 'Punta Banda', '00000000-0000-0000-0000-000000000013', 'delegacion', 'MX', '02001-16', 'America/Tijuana', false, true);

-- San Quintín delegaciones (8)
INSERT INTO jurisdictions (id, name, name_en, parent_id, level, country_code, inegi_clave, timezone, escalation_enabled, verified) VALUES
('00000000-0000-0000-00d4-000000000001', 'San Quintín Centro', 'San Quintin Downtown', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-01', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000002', 'Vicente Guerrero', 'Vicente Guerrero', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-02', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000003', 'Lázaro Cárdenas', 'Lazaro Cardenas', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-03', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000004', 'Punta Prieta', 'Punta Prieta', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-04', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000005', 'Bahía de los Ángeles', 'Bahia de los Angeles', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-05', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000006', 'El Mármol', 'El Marmol', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-06', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000007', 'Santa María', 'Santa Maria', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-07', 'America/Tijuana', false, true),
('00000000-0000-0000-00d4-000000000008', 'Cataviña', 'Catavina', '00000000-0000-0000-0000-000000000015', 'delegacion', 'MX', '02006-08', 'America/Tijuana', false, true);

-- =============================================================================
-- 4. User Jurisdiction Assignments
-- =============================================================================

INSERT INTO user_jurisdictions (user_id, jurisdiction_id) VALUES
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010'), -- Ana moderator → Tijuana
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010'); -- Roberto government → Tijuana

-- =============================================================================
-- 4b. Jurisdiction Authorities (seeded into new table)
-- =============================================================================

-- Delete any migrated data from the migration script to avoid duplicates
DELETE FROM jurisdiction_authorities;

-- === State-level (Baja California) ===

-- SMADS - Dirección de Derecho y Bienestar Animal (escalation for all municipalities)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000020',
  'escalation', 'smads',
  'Secretaría de Medio Ambiente y Desarrollo Sustentable',
  'Dirección de Derecho y Bienestar Animal',
  'bienestar.animal@bajacalifornia.gob.mx',
  '+526861211000',
  'https://www.bajacalifornia.gob.mx/smads',
  ARRAY['abuse', 'stray', 'missing', 'injured', 'zoonotic', 'dead_animal', 'dangerous_dog', 'distress'],
  'verified'
);

-- Fiscalía Especializada (criminal cases — state level)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000020',
  'enforcement', 'fiscalia',
  'Fiscalía General del Estado de Baja California',
  'Fiscalía Especializada en Delitos contra el Medio Ambiente y Animales',
  'fiscalia.ambiental@bajacalifornia.gob.mx',
  '+526861211300',
  'https://www.fgebc.gob.mx',
  ARRAY['abuse'],
  'verified'
);

-- === Tijuana (02004) ===

-- Dept. Control Animal (primary)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'primary', 'control_animal',
  'Ayuntamiento de Tijuana',
  'Departamento de Control Animal',
  'control.animal@tijuana.gob.mx',
  '+526646888800',
  'https://www.tijuana.gob.mx',
  ARRAY['abuse', 'stray', 'missing', 'injured', 'dead_animal', 'dangerous_dog', 'distress'],
  'verified'
);

-- Seguridad Pública (enforcement — abuse, dangerous dogs)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'enforcement', 'seguridad_publica',
  'Secretaría de Seguridad Ciudadana de Tijuana',
  'Dirección de Seguridad Pública',
  'seguridad@tijuana.gob.mx',
  '+526646841300',
  'https://www.tijuana.gob.mx/seguridad',
  ARRAY['abuse', 'dangerous_dog'],
  'verified'
);

-- Juez Cívico (specialized — noise nuisance)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'specialized', 'seguridad_publica',
  'Juzgados Cívicos Municipales de Tijuana',
  'Juez Cívico',
  'juzgados.civicos@tijuana.gob.mx',
  '+526646841400',
  'https://www.tijuana.gob.mx/juzgados-civicos',
  ARRAY['noise_nuisance'],
  'verified'
);

-- === Mexicali (02002) ===

-- CEMCA (primary)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000012',
  'primary', 'control_animal',
  'Ayuntamiento de Mexicali',
  'Centro Municipal de Control Animal (CEMCA)',
  'cemca@mexicali.gob.mx',
  '+526865522200',
  'https://www.mexicali.gob.mx',
  ARRAY['abuse', 'stray', 'missing', 'injured', 'dead_animal', 'dangerous_dog', 'distress'],
  'verified'
);

-- Seguridad Pública (enforcement)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000012',
  'enforcement', 'seguridad_publica',
  'Dirección de Seguridad Pública Municipal de Mexicali',
  NULL,
  'seguridad@mexicali.gob.mx',
  '+526865522300',
  'https://www.mexicali.gob.mx/seguridad',
  ARRAY['abuse', 'dangerous_dog'],
  'verified'
);

-- === Ensenada (02001) ===

-- Dirección de Ecología (primary)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000013',
  'primary', 'ecologia',
  'Ayuntamiento de Ensenada',
  'Dirección de Ecología',
  'ecologia@ensenada.gob.mx',
  '+526461780100',
  'https://www.ensenada.gob.mx',
  ARRAY['abuse', 'stray', 'missing', 'injured', 'dead_animal', 'distress', 'wildlife'],
  'verified'
);

-- Dirección de Seguridad Pública (enforcement)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000013',
  'enforcement', 'seguridad_publica',
  'Dirección de Seguridad Pública de Ensenada',
  NULL,
  'seguridad@ensenada.gob.mx',
  '+526461780200',
  'https://www.ensenada.gob.mx/seguridad',
  ARRAY['abuse', 'dangerous_dog'],
  'verified'
);

-- Servicios Médicos (specialized — zoonotic)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000013',
  'specialized', 'salud',
  'Servicios Médicos Municipales de Ensenada',
  NULL,
  'salud@ensenada.gob.mx',
  '+526461780300',
  'https://www.ensenada.gob.mx/salud',
  ARRAY['zoonotic'],
  'unverified'
);

-- === Tecate (02003) ===

-- Dept. Ecología (primary, only authority)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000014',
  'primary', 'ecologia',
  'Ayuntamiento de Tecate',
  'Departamento de Ecología',
  'ecologia@tecate.gob.mx',
  '+526656543300',
  'https://www.tecate.gob.mx',
  ARRAY['abuse', 'stray', 'missing', 'injured', 'dead_animal', 'dangerous_dog', 'distress'],
  'unverified'
);

-- === Playas de Rosarito (02005) ===

-- Dept. Control Animal (primary)
INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, department_name, email, phone, url,
  handles_report_types, verification
) VALUES (
  '00000000-0000-0000-0000-000000000011',
  'primary', 'control_animal',
  'Ayuntamiento de Playas de Rosarito',
  'Departamento de Control Animal',
  'control.animal@rosarito.gob.mx',
  '+526613612000',
  'https://www.rosarito.gob.mx',
  ARRAY['abuse', 'stray', 'missing', 'injured', 'dead_animal', 'dangerous_dog', 'distress'],
  'unverified'
);

-- === San Quintín (02006) & San Felipe (02007) ===
-- No local animal authority — state-level SMADS is the fallback

-- =============================================================================
-- 5. Cases (30 total: 25 original + 5 new injured cases)
-- =============================================================================

-- Case 1: Stray dog - Zona Centro - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 2: Abuse - Playas de Tijuana - verified - Carlos - folio TJ-2026-001
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000003',
  'abuse',
  'dog',
  'Possible animal abuse reported - dog chained outside without shelter or water. Neighbors report constant barking and distress.',
  ST_SetSRID(ST_MakePoint(-117.1232, 32.5218), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'verified',
  'TJ-2026-001',
  now() - interval '5 days',
  now() - interval '4 days'
);

-- Case 3: Missing cat - Zona Río - in_progress - María - folio TJ-2026-002
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'missing',
  'cat',
  'Missing tabby cat, last seen near Parque Morelos. Orange and white stripes, wearing blue collar with bell.',
  ST_SetSRID(ST_MakePoint(-117.0102, 32.5172), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'in_progress',
  'TJ-2026-002',
  now() - interval '7 days',
  now() - interval '6 days'
);

-- Case 4: Stray - Otay - pending - Carlos
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
  '00000000-0000-0000-0000-000000000003',
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

-- Case 5: Abuse - La Mesa - resolved - Admin - folio TJ-2026-003
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
  folio,
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
  'TJ-2026-003',
  now() - interval '15 days',
  now() - interval '10 days'
);

-- Case 6: Stray - Zona Norte - verified - Laura - folio TJ-2026-004
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000006',
  '00000000-0000-0000-0000-000000000006',
  'stray',
  'dog',
  'Injured stray dog hiding under parked cars. Has visible wounds and is very scared of people.',
  ST_SetSRID(ST_MakePoint(-117.0228, 32.5352), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'verified',
  'TJ-2026-004',
  now() - interval '4 days',
  now() - interval '3 days'
);

-- Case 7: Missing - Colonia Libertad - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 8: Abuse - Hipódromo - in_progress - Carlos - folio TJ-2026-005
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000008',
  '00000000-0000-0000-0000-000000000003',
  'abuse',
  'dog',
  'Dog left in hot car in parking lot. Windows barely cracked, dog appears to be panting heavily.',
  ST_SetSRID(ST_MakePoint(-117.0252, 32.5088), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  'TJ-2026-005',
  now() - interval '6 hours',
  now() - interval '5 hours'
);

-- Case 9: Stray - Chapultepec - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 10: Missing - Cacho - resolved - Admin - folio TJ-2026-006
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
  folio,
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
  'TJ-2026-006',
  now() - interval '20 days',
  now() - interval '12 days'
);

-- Case 11: Stray - Sánchez Taboada - verified - Carlos - folio TJ-2026-007
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000011',
  '00000000-0000-0000-0000-000000000003',
  'stray',
  'dog',
  'Pregnant stray dog seeking shelter near construction site. Needs immediate rescue before giving birth.',
  ST_SetSRID(ST_MakePoint(-116.9798, 32.4902), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'verified',
  'TJ-2026-007',
  now() - interval '9 days',
  now() - interval '8 days'
);

-- Case 12: Abuse - Francisco Villa - in_progress - Laura - folio TJ-2026-008
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000012',
  '00000000-0000-0000-0000-000000000006',
  'abuse',
  'bird',
  'Parrots in very small cage, appears to be illegal wildlife trafficking. Birds look distressed and malnourished.',
  ST_SetSRID(ST_MakePoint(-116.9702, 32.4798), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'in_progress',
  'TJ-2026-008',
  now() - interval '11 days',
  now() - interval '10 days'
);

-- Case 13: Missing - El Florido - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 14: Stray - Zona Centro - resolved - Admin - folio TJ-2026-009
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
  folio,
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
  'TJ-2026-009',
  now() - interval '18 days',
  now() - interval '16 days'
);

-- Case 15: Abuse - Playas de Tijuana - verified - Admin - folio TJ-2026-010
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
  folio,
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
  'TJ-2026-010',
  now() - interval '6 days',
  now() - interval '5 days'
);

-- Case 16: Missing - Zona Río - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 17: Stray - Otay - in_progress - Carlos - folio TJ-2026-011
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000017',
  '00000000-0000-0000-0000-000000000003',
  'stray',
  'dog',
  'Elderly dog wandering busy street, appears disoriented and at risk of being hit by traffic.',
  ST_SetSRID(ST_MakePoint(-116.9595, 32.5455), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  'TJ-2026-011',
  now() - interval '14 hours',
  now() - interval '13 hours'
);

-- Case 18: Abuse - La Mesa - verified - Laura - folio TJ-2026-012
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000018',
  '00000000-0000-0000-0000-000000000006',
  'abuse',
  'other',
  'Rabbit being kept in tiny cage outdoors with no shade. Temperature extremely high, animal showing signs of heat stress.',
  ST_SetSRID(ST_MakePoint(-116.9505, 32.5095), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'verified',
  'TJ-2026-012',
  now() - interval '10 days',
  now() - interval '9 days'
);

-- Case 19: Missing - Zona Norte - resolved - Admin - folio TJ-2026-013
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
  folio,
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
  'TJ-2026-013',
  now() - interval '25 days',
  now() - interval '22 days'
);

-- Case 20: Stray - Colonia Libertad - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 21: Abuse - Hipódromo - in_progress - Carlos - folio TJ-2026-014
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000021',
  '00000000-0000-0000-0000-000000000003',
  'abuse',
  'dog',
  'Dog being used for fighting training. Multiple scars visible, very aggressive behavior indicating abuse.',
  ST_SetSRID(ST_MakePoint(-117.0245, 32.5092), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  'TJ-2026-014',
  now() - interval '13 days',
  now() - interval '12 days'
);

-- Case 22: Missing - Chapultepec - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 23: Stray - Cacho - resolved - Admin - folio TJ-2026-015
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
  folio,
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
  'TJ-2026-015',
  now() - interval '28 days',
  now() - interval '25 days'
);

-- Case 24: Abuse - Sánchez Taboada - in_progress - Carlos - folio TJ-2026-016
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000024',
  '00000000-0000-0000-0000-000000000003',
  'abuse',
  'cat',
  'Multiple cats being hoarded in residence. Strong odor, animals appear sick and malnourished.',
  ST_SetSRID(ST_MakePoint(-116.9805, 32.4898), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'in_progress',
  'TJ-2026-016',
  now() - interval '17 days',
  now() - interval '16 days'
);

-- Case 25: Missing - Francisco Villa - pending - María
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
  '00000000-0000-0000-0000-000000000002',
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

-- Case 26: Injured - Zona Centro - verified - María - folio TJ-2026-017
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000026',
  '00000000-0000-0000-0000-000000000002',
  'injured',
  'dog',
  'Dog hit by car on Boulevard Agua Caliente. Appears to have broken leg, cannot walk. Lying on sidewalk.',
  ST_SetSRID(ST_MakePoint(-117.0150, 32.5200), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'high',
  'verified',
  'TJ-2026-017',
  now() - interval '2 days',
  now() - interval '1 day 18 hours'
);

-- Case 27: Injured - Otay - in_progress - Carlos - folio TJ-2026-018
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000027',
  '00000000-0000-0000-0000-000000000003',
  'injured',
  'cat',
  'Cat found with severe burns, possibly from chemicals. Hiding under car, needs immediate vet attention.',
  ST_SetSRID(ST_MakePoint(-116.9550, 32.5400), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  'TJ-2026-018',
  now() - interval '18 hours',
  now() - interval '17 hours'
);

-- Case 28: Injured - Playas de Rosarito - pending - Laura - NO FOLIO
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
  '00000000-0000-0000-0001-000000000028',
  '00000000-0000-0000-0000-000000000006',
  'injured',
  'dog',
  'Puppy found by the beach with deep cuts, possibly from barbed wire. Bleeding and whimpering.',
  ST_SetSRID(ST_MakePoint(-117.0600, 32.3600), 4326)::geography,
  '00000000-0000-0000-0000-000000000011',
  'high',
  'pending',
  now() - interval '6 hours',
  now() - interval '6 hours'
);

-- Case 29: Injured - Chapultepec - verified - María - folio TJ-2026-019
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000029',
  '00000000-0000-0000-0000-000000000002',
  'injured',
  'bird',
  'Injured pelican found on beach, appears to have fishing line wrapped around wing.',
  ST_SetSRID(ST_MakePoint(-117.0340, 32.5145), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'medium',
  'verified',
  'TJ-2026-019',
  now() - interval '5 days',
  now() - interval '4 days 12 hours'
);

-- Case 30: Injured - Hipódromo - in_progress - Carlos - folio TJ-2026-020
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
  folio,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0001-000000000030',
  '00000000-0000-0000-0000-000000000003',
  'injured',
  'dog',
  'Large dog with open wound on side, possibly from machete. Very aggressive due to pain, approach with caution.',
  ST_SetSRID(ST_MakePoint(-117.0240, 32.5095), 4326)::geography,
  '00000000-0000-0000-0000-000000000010',
  'critical',
  'in_progress',
  'TJ-2026-020',
  now() - interval '1 day',
  now() - interval '23 hours'
);

-- =============================================================================
-- 6. Case Media (35 images across 15 cases)
-- =============================================================================

-- Case 1: Stray dog - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', 'https://picsum.photos/seed/stray-dog-1/800/600', 'image', 'https://picsum.photos/seed/stray-dog-1/200/150', 0),
('00000000-0000-0000-0001-000000000001', 'https://picsum.photos/seed/stray-dog-1b/800/600', 'image', 'https://picsum.photos/seed/stray-dog-1b/200/150', 1);

-- Case 2: Abuse dog - 3 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000002', 'https://picsum.photos/seed/abuse-dog-2/800/600', 'image', 'https://picsum.photos/seed/abuse-dog-2/200/150', 0),
('00000000-0000-0000-0001-000000000002', 'https://picsum.photos/seed/abuse-dog-2b/800/600', 'image', 'https://picsum.photos/seed/abuse-dog-2b/200/150', 1),
('00000000-0000-0000-0001-000000000002', 'https://picsum.photos/seed/abuse-dog-2c/800/600', 'image', 'https://picsum.photos/seed/abuse-dog-2c/200/150', 2);

-- Case 3: Missing cat - 1 image
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000003', 'https://picsum.photos/seed/missing-cat-3/800/600', 'image', 'https://picsum.photos/seed/missing-cat-3/200/150', 0);

-- Case 6: Stray injured dog - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000006', 'https://picsum.photos/seed/stray-dog-6/800/600', 'image', 'https://picsum.photos/seed/stray-dog-6/200/150', 0),
('00000000-0000-0000-0001-000000000006', 'https://picsum.photos/seed/stray-dog-6b/800/600', 'image', 'https://picsum.photos/seed/stray-dog-6b/200/150', 1);

-- Case 7: Missing chihuahua - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000007', 'https://picsum.photos/seed/missing-dog-7/800/600', 'image', 'https://picsum.photos/seed/missing-dog-7/200/150', 0),
('00000000-0000-0000-0001-000000000007', 'https://picsum.photos/seed/missing-dog-7b/800/600', 'image', 'https://picsum.photos/seed/missing-dog-7b/200/150', 1);

-- Case 8: Abuse dog in car - 3 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000008', 'https://picsum.photos/seed/abuse-car-8/800/600', 'image', 'https://picsum.photos/seed/abuse-car-8/200/150', 0),
('00000000-0000-0000-0001-000000000008', 'https://picsum.photos/seed/abuse-car-8b/800/600', 'image', 'https://picsum.photos/seed/abuse-car-8b/200/150', 1),
('00000000-0000-0000-0001-000000000008', 'https://picsum.photos/seed/abuse-car-8c/800/600', 'image', 'https://picsum.photos/seed/abuse-car-8c/200/150', 2);

-- Case 11: Pregnant stray - 3 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000011', 'https://picsum.photos/seed/pregnant-dog-11/800/600', 'image', 'https://picsum.photos/seed/pregnant-dog-11/200/150', 0),
('00000000-0000-0000-0001-000000000011', 'https://picsum.photos/seed/pregnant-dog-11b/800/600', 'image', 'https://picsum.photos/seed/pregnant-dog-11b/200/150', 1),
('00000000-0000-0000-0001-000000000011', 'https://picsum.photos/seed/pregnant-dog-11c/800/600', 'image', 'https://picsum.photos/seed/pregnant-dog-11c/200/150', 2);

-- Case 12: Parrots in cage - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000012', 'https://picsum.photos/seed/parrots-12/800/600', 'image', 'https://picsum.photos/seed/parrots-12/200/150', 0),
('00000000-0000-0000-0001-000000000012', 'https://picsum.photos/seed/parrots-12b/800/600', 'image', 'https://picsum.photos/seed/parrots-12b/200/150', 1);

-- Case 14: Abandoned kitten - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000014', 'https://picsum.photos/seed/kitten-14/800/600', 'image', 'https://picsum.photos/seed/kitten-14/200/150', 0),
('00000000-0000-0000-0001-000000000014', 'https://picsum.photos/seed/kitten-14b/800/600', 'image', 'https://picsum.photos/seed/kitten-14b/200/150', 1);

-- Case 15: Unsanitary conditions - 3 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000015', 'https://picsum.photos/seed/unsanitary-15/800/600', 'image', 'https://picsum.photos/seed/unsanitary-15/200/150', 0),
('00000000-0000-0000-0001-000000000015', 'https://picsum.photos/seed/unsanitary-15b/800/600', 'image', 'https://picsum.photos/seed/unsanitary-15b/200/150', 1),
('00000000-0000-0000-0001-000000000015', 'https://picsum.photos/seed/unsanitary-15c/800/600', 'image', 'https://picsum.photos/seed/unsanitary-15c/200/150', 2);

-- Case 20: Injured cat with damaged eye - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000020', 'https://picsum.photos/seed/injured-cat-20/800/600', 'image', 'https://picsum.photos/seed/injured-cat-20/200/150', 0),
('00000000-0000-0000-0001-000000000020', 'https://picsum.photos/seed/injured-cat-20b/800/600', 'image', 'https://picsum.photos/seed/injured-cat-20b/200/150', 1);

-- Case 21: Fighting training - 3 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000021', 'https://picsum.photos/seed/fighting-dog-21/800/600', 'image', 'https://picsum.photos/seed/fighting-dog-21/200/150', 0),
('00000000-0000-0000-0001-000000000021', 'https://picsum.photos/seed/fighting-dog-21b/800/600', 'image', 'https://picsum.photos/seed/fighting-dog-21b/200/150', 1),
('00000000-0000-0000-0001-000000000021', 'https://picsum.photos/seed/fighting-dog-21c/800/600', 'image', 'https://picsum.photos/seed/fighting-dog-21c/200/150', 2);

-- Case 26: Injured dog hit by car - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000026', 'https://picsum.photos/seed/hit-by-car-26/800/600', 'image', 'https://picsum.photos/seed/hit-by-car-26/200/150', 0),
('00000000-0000-0000-0001-000000000026', 'https://picsum.photos/seed/hit-by-car-26b/800/600', 'image', 'https://picsum.photos/seed/hit-by-car-26b/200/150', 1);

-- Case 27: Burned cat - 3 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000027', 'https://picsum.photos/seed/burned-cat-27/800/600', 'image', 'https://picsum.photos/seed/burned-cat-27/200/150', 0),
('00000000-0000-0000-0001-000000000027', 'https://picsum.photos/seed/burned-cat-27b/800/600', 'image', 'https://picsum.photos/seed/burned-cat-27b/200/150', 1),
('00000000-0000-0000-0001-000000000027', 'https://picsum.photos/seed/burned-cat-27c/800/600', 'image', 'https://picsum.photos/seed/burned-cat-27c/200/150', 2);

-- Case 30: Dog with machete wound - 2 images
INSERT INTO case_media (case_id, url, type, thumbnail_url, sort_order) VALUES
('00000000-0000-0000-0001-000000000030', 'https://picsum.photos/seed/machete-wound-30/800/600', 'image', 'https://picsum.photos/seed/machete-wound-30/200/150', 0),
('00000000-0000-0000-0001-000000000030', 'https://picsum.photos/seed/machete-wound-30b/800/600', 'image', 'https://picsum.photos/seed/machete-wound-30b/200/150', 1);

-- =============================================================================
-- 7. Case Subscriptions (cross-user only, auto_subscribe_reporter handles own cases)
-- =============================================================================

INSERT INTO case_subscriptions (user_id, case_id) VALUES
-- María subscribes to 5 cases by Carlos/Laura
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000002'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000004'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000006'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000011'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000018'),
-- Carlos subscribes to 3 cases by María
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000001'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000003'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000007'),
-- Admin subscribes to 2 additional cases
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. Case Flags (trigger auto-increments flag_count and creates flagged timeline)
-- =============================================================================

-- Case 9 (stray cats): 2 flags
INSERT INTO case_flags (case_id, reporter_id, reason) VALUES
('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000003', 'Inaccurate location - building was demolished last month'),
('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000006', 'Duplicate report - same situation reported in case nearby');

-- Case 20 (injured cat): 1 flag
INSERT INTO case_flags (case_id, reporter_id, reason) VALUES
('00000000-0000-0000-0001-000000000020', '00000000-0000-0000-0000-000000000006', 'Photo appears to be from internet, not original');

-- =============================================================================
-- 9. Donations (15 total: 6 Mercado Pago, 4 Stripe, 3 OXXO, 2 SPEI)
-- =============================================================================

INSERT INTO donations (amount, currency, method, donor_id, recurring, external_id, status, created_at) VALUES
-- Mercado Pago (6)
(500.00, 'MXN', 'mercado_pago', '00000000-0000-0000-0000-000000000002', false, 'mp_pay_001', 'approved', now() - interval '3 days'),
(1000.00, 'MXN', 'mercado_pago', '00000000-0000-0000-0000-000000000003', true, 'mp_pay_002', 'approved', now() - interval '10 days'),
(200.00, 'MXN', 'mercado_pago', '00000000-0000-0000-0000-000000000002', false, 'mp_pay_003', 'approved', now() - interval '20 days'),
(2000.00, 'MXN', 'mercado_pago', NULL, false, 'mp_pay_004', 'approved', now() - interval '35 days'),
(150.00, 'MXN', 'mercado_pago', '00000000-0000-0000-0000-000000000006', false, 'mp_pay_005', 'pending', now() - interval '1 day'),
(100.00, 'MXN', 'mercado_pago', NULL, false, 'mp_pay_006', 'pending', now() - interval '2 hours'),

-- Stripe (4)
(1500.00, 'MXN', 'stripe', '00000000-0000-0000-0000-000000000003', false, 'pi_stripe_001', 'approved', now() - interval '7 days'),
(5000.00, 'MXN', 'stripe', '00000000-0000-0000-0000-000000000002', true, 'pi_stripe_002', 'approved', now() - interval '15 days'),
(500.00, 'MXN', 'stripe', NULL, false, 'pi_stripe_003', 'approved', now() - interval '25 days'),
(50.00, 'USD', 'stripe', '00000000-0000-0000-0000-000000000006', false, 'pi_stripe_004', 'approved', now() - interval '40 days'),

-- OXXO (3)
(300.00, 'MXN', 'oxxo', '00000000-0000-0000-0000-000000000002', false, 'oxxo_ref_001', 'approved', now() - interval '5 days'),
(250.00, 'MXN', 'oxxo', '00000000-0000-0000-0000-000000000003', false, 'oxxo_ref_002', 'pending', now() - interval '12 hours'),
(400.00, 'MXN', 'oxxo', NULL, false, 'oxxo_ref_003', 'rejected', now() - interval '8 days'),

-- SPEI (2)
(3000.00, 'MXN', 'spei', '00000000-0000-0000-0000-000000000003', true, 'spei_ref_001', 'approved', now() - interval '12 days'),
(1500.00, 'MXN', 'spei', '00000000-0000-0000-0000-000000000006', false, 'spei_ref_002', 'approved', now() - interval '30 days');

-- =============================================================================
-- 10. Enriched Timeline Entries
-- =============================================================================
-- Note: auto_create_timeline trigger creates 'created' entries automatically
-- We manually add verified/status_changed/escalated/government_response/comment/media_added entries

-- Case 2: Abuse - verified then escalated then government_response
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Location confirmed, forwarding to authorities"}'::jsonb, now() - interval '4 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000004', 'escalated', '{"authority": "Dirección de Bienestar Animal", "email": "bienestar.animal@tijuana.gob.mx"}'::jsonb, now() - interval '3 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', 'government_response', '{"text": "Inspectors dispatched to verify the complaint. Will follow up within 48 hours."}'::jsonb, now() - interval '2 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000003', 'media_added', '{"count": 3}'::jsonb, now() - interval '5 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'comment', '{"text": "I pass by this house daily and can confirm the dog is still chained outside"}'::jsonb, now() - interval '4 days 6 hours');

-- Case 3: Missing cat - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Owner information verified"}'::jsonb, now() - interval '6 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Local volunteer searching neighborhood"}'::jsonb, now() - interval '5 days 12 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002', 'media_added', '{"count": 1}'::jsonb, now() - interval '7 days');

-- Case 5: Abuse - verified, in_progress, then resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Emergency rescue needed"}'::jsonb, now() - interval '14 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Fire department contacted for rooftop rescue"}'::jsonb, now() - interval '13 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'status_changed', '{"from": "in_progress", "to": "resolved", "notes": "Cat safely rescued and returned to owner"}'::jsonb, now() - interval '10 days');

-- Case 6: Stray - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Critical condition confirmed, rescue team dispatched"}'::jsonb, now() - interval '3 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000006', 'media_added', '{"count": 2}'::jsonb, now() - interval '4 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000004', 'comment', '{"text": "Dog is very scared but accepted food from volunteer"}'::jsonb, now() - interval '3 days 6 hours');

-- Case 8: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Police notified, immediate response required"}'::jsonb, now() - interval '5 hours 30 minutes');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000005', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Police on scene"}'::jsonb, now() - interval '5 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000003', 'media_added', '{"count": 3}'::jsonb, now() - interval '6 hours');

-- Case 10: Missing - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Microchip information verified"}'::jsonb, now() - interval '19 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Cat spotted two blocks away"}'::jsonb, now() - interval '15 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000001', 'status_changed', '{"from": "in_progress", "to": "resolved", "notes": "Cat safely recovered and returned home"}'::jsonb, now() - interval '12 days');

-- Case 11: Stray - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Pregnant dog confirmed, emergency shelter arranged"}'::jsonb, now() - interval '8 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000003', 'media_added', '{"count": 3}'::jsonb, now() - interval '9 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000004', 'comment', '{"text": "Contacted local rescue group, they can take her in once she gives birth"}'::jsonb, now() - interval '7 days');

-- Case 12: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Wildlife authorities contacted"}'::jsonb, now() - interval '10 days 12 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000005', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "PROFEPA investigating"}'::jsonb, now() - interval '10 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000006', 'media_added', '{"count": 2}'::jsonb, now() - interval '11 days');

-- Case 14: Stray - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Kitten needs immediate veterinary care"}'::jsonb, now() - interval '17 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Kitten picked up by volunteer, en route to vet"}'::jsonb, now() - interval '16 days 18 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000001', 'status_changed', '{"from": "in_progress", "to": "resolved", "notes": "Kitten healthy and placed in foster home"}'::jsonb, now() - interval '16 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000001', 'media_added', '{"count": 2}'::jsonb, now() - interval '18 days');

-- Case 15: Abuse - verified then escalated
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Severe neglect confirmed, animal control notified"}'::jsonb, now() - interval '5 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000004', 'escalated', '{"authority": "Dirección de Bienestar Animal", "email": "bienestar.animal@tijuana.gob.mx"}'::jsonb, now() - interval '4 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000001', 'media_added', '{"count": 3}'::jsonb, now() - interval '6 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000004', 'comment', '{"text": "Owner has been notified and given 48 hours to improve conditions"}'::jsonb, now() - interval '5 days 6 hours');

-- Case 17: Stray - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000017', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Elderly dog in traffic confirmed, urgent rescue needed"}'::jsonb, now() - interval '13 hours 30 minutes');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000017', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Volunteer on location attempting safe capture"}'::jsonb, now() - interval '13 hours');

-- Case 18: Abuse - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000018', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Heat stress confirmed, animal welfare check scheduled"}'::jsonb, now() - interval '9 days');

-- Case 19: Missing - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000019', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Owner information verified, search area identified"}'::jsonb, now() - interval '24 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000019', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Beagle sighted near taco stand, volunteers searching"}'::jsonb, now() - interval '23 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000019', '00000000-0000-0000-0000-000000000001', 'status_changed', '{"from": "in_progress", "to": "resolved", "notes": "Beagle caught with treats and returned to owner"}'::jsonb, now() - interval '22 days');

-- Case 21: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Fighting training confirmed, authorities alerted"}'::jsonb, now() - interval '12 days 12 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000005', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Criminal investigation underway"}'::jsonb, now() - interval '12 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000003', 'media_added', '{"count": 3}'::jsonb, now() - interval '13 days');

-- Case 23: Stray - verified, in_progress, resolved
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Puppy condition assessed, needs immediate care"}'::jsonb, now() - interval '27 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Puppy taken to vet for checkup"}'::jsonb, now() - interval '26 days');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000001', 'status_changed', '{"from": "in_progress", "to": "resolved", "notes": "Puppy healthy, vaccinated, and adopted"}'::jsonb, now() - interval '25 days');

-- Case 24: Abuse - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000024', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Hoarding situation confirmed, health hazard"}'::jsonb, now() - interval '16 days 12 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000024', '00000000-0000-0000-0000-000000000005', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Animal control working with owner on rehoming plan"}'::jsonb, now() - interval '16 days');

-- Case 26: Injured dog hit by car - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000026', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Injury confirmed, rescue team dispatched"}'::jsonb, now() - interval '1 day 18 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000026', '00000000-0000-0000-0000-000000000002', 'media_added', '{"count": 2}'::jsonb, now() - interval '2 days');

-- Case 27: Burned cat - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000027', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Chemical burns confirmed, emergency vet transport arranged"}'::jsonb, now() - interval '17 hours 30 minutes');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000027', '00000000-0000-0000-0000-000000000004', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Cat in emergency care, condition critical"}'::jsonb, now() - interval '17 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000027', '00000000-0000-0000-0000-000000000003', 'media_added', '{"count": 3}'::jsonb, now() - interval '18 hours');

-- Case 29: Injured pelican - verified
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000029', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Wildlife rescue contacted for pelican rescue"}'::jsonb, now() - interval '4 days 12 hours');

-- Case 30: Dog with machete wound - verified then in_progress
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000030', '00000000-0000-0000-0000-000000000004', 'verified', '{"notes": "Severe injury confirmed, dangerous approach - animal control backup requested"}'::jsonb, now() - interval '23 hours 30 minutes');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000030', '00000000-0000-0000-0000-000000000005', 'status_changed', '{"from": "verified", "to": "in_progress", "notes": "Animal control on scene with tranquilizer equipment"}'::jsonb, now() - interval '23 hours');

INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000030', '00000000-0000-0000-0000-000000000003', 'media_added', '{"count": 2}'::jsonb, now() - interval '1 day');

-- Cross-user comments
INSERT INTO case_timeline (case_id, actor_id, action, details, created_at) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000003', 'comment', '{"text": "I think I saw this dog near my work yesterday, might be moving around"}'::jsonb, now() - interval '1 day 12 hours');

-- =============================================================================
-- 11. Escalation Data
-- =============================================================================

-- Case 2: Escalated with government response
UPDATE cases SET
  escalated_at = now() - interval '3 days',
  escalation_email_id = 're_abc123',
  government_response_at = now() - interval '2 days',
  escalation_reminder_count = 1
WHERE id = '00000000-0000-0000-0001-000000000002';

-- Case 15: Escalated with reminders, no response yet
UPDATE cases SET
  escalated_at = now() - interval '4 days',
  escalation_email_id = 're_def456',
  escalation_reminder_count = 2,
  marked_unresponsive = false
WHERE id = '00000000-0000-0000-0001-000000000015';
