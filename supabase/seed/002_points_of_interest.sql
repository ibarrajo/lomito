-- =============================================================================
-- Seed data: Points of Interest for Tijuana, Baja California
-- Research date: 2026-02-17
-- Sources: Official government directories, Yelp, Google Maps, Rankeando, Bekaab
-- =============================================================================

INSERT INTO points_of_interest (poi_type, vet_subtype, name, address, phone, email, url, hours, capacity, location, jurisdiction_id, verified)
VALUES

-- ---------------------------------------------------------------------------
-- GOVERNMENT OFFICES
-- ---------------------------------------------------------------------------

  (
    'government_office', NULL,
    'Control Animal Municipal de Tijuana',
    'Blvd. Insurgentes S/N, Col. Meseta del Chema, C.P. 22225, Tijuana, B.C.',
    '+52 664 208 9212',
    'controlanimal@tijuana.gob.mx',
    'https://www.tijuana.gob.mx/dependencias/cam/principal.aspx',
    'Lun-Vie 8:00-15:00, Sáb 8:00-13:00',
    NULL,
    ST_SetSRID(ST_MakePoint(-116.90734765, 32.46195376), 4326)::geography,
    NULL, false
  ),

  (
    'government_office', NULL,
    'Secretaría de Protección al Ambiente de Tijuana',
    'Av. Paseo Centenario No. 10252, Col. Zona Río, C.P. 22010, Tijuana, B.C.',
    '+52 664 973 7000 ext. 7678',
    NULL,
    'https://www.tijuana.gob.mx/dependencias/sdue/dpa/',
    'Lun-Vie 8:00-15:00',
    NULL,
    ST_SetSRID(ST_MakePoint(-117.01595, 32.53127), 4326)::geography,
    NULL, false
  ),

  (
    'government_office', NULL,
    'Protección Civil Municipal de Tijuana',
    'Av. Guadalupe Ramírez y Segunda Sur S/N, Col. Del Río, C.P. 22416, Tijuana, B.C.',
    '+52 664 683 9112',
    'proteccioncivil@tijuana.gob.mx',
    'https://proteccioncivil.tijuana.gob.mx/',
    'Lun-Vie 8:00-17:00',
    NULL,
    ST_SetSRID(ST_MakePoint(-116.99370500, 32.52701500), 4326)::geography,
    NULL, false
  ),

  (
    'government_office', NULL,
    'Secretaría de Medio Ambiente y Desarrollo Sustentable de B.C. — Oficina Tijuana',
    'Calle 2 Oriente No. 16, Parque Ciudad Industrial, C.P. 22444, Tijuana, B.C.',
    '+52 664 607 4606',
    NULL,
    'https://www.bajacalifornia.gob.mx/medio_ambiente',
    'Lun-Vie 8:00-15:00',
    NULL,
    ST_SetSRID(ST_MakePoint(-116.9212, 32.5298), 4326)::geography,
    NULL, false
  ),

-- ---------------------------------------------------------------------------
-- ANIMAL SHELTERS
-- ---------------------------------------------------------------------------

  (
    'animal_shelter', NULL,
    'Bordertown Animal Rescue / Fronterizo Rescate Animales',
    'C. R. Justo Sierra, Col. Patrimonio Familiar, C.P. 22640, Tijuana, B.C.',
    '+52 664 355 8973',
    NULL,
    'https://www.facebook.com/bordertownrescue',
    'Con cita previa (24/7 emergencias)',
    NULL,
    ST_SetSRID(ST_MakePoint(-117.0052, 32.4585), 4326)::geography,
    NULL, false
  ),

  (
    'animal_shelter', NULL,
    'Pitbulls Nueva Vida',
    'Ejido Francisco Villa, C.P. 22200, Tijuana, B.C.',
    '+52 664 601 0866',
    NULL,
    'https://pitbulls-nueva-vida.ueniweb.com/',
    NULL,
    NULL,
    ST_SetSRID(ST_MakePoint(-116.8850, 32.4450), 4326)::geography,
    NULL, false
  ),

  (
    'animal_shelter', NULL,
    'Centro de Rescate Animal Tijuana A.C. (CRATAC)',
    'Tijuana, B.C.',
    NULL,
    'cratac@live.com.mx',
    'https://www.facebook.com/cratac',
    NULL,
    NULL,
    ST_SetSRID(ST_MakePoint(-117.0195, 32.5025), 4326)::geography,
    NULL, false
  ),

-- ---------------------------------------------------------------------------
-- VET CLINICS — 24 HOUR
-- ---------------------------------------------------------------------------

  (
    'vet_clinic', 'hours_24',
    'Profauna Hospital Veterinario 24 Horas',
    'Blvd. Fundadores 3008, Col. Juárez, C.P. 22040, Tijuana, B.C.',
    '+52 664 200 2451',
    NULL,
    'https://www.profauna.com.mx/',
    '24 horas, 7 días',
    NULL,
    ST_SetSRID(ST_MakePoint(-117.031127, 32.513548), 4326)::geography,
    NULL, false
  ),

  (
    'vet_clinic', 'hours_24',
    'Hospital de Mascotas SAJI — Río Tijuana',
    'Vía Rápida Oriente 6876, Río Tijuana 3a Etapa, C.P. 22226, Tijuana, B.C.',
    '+52 664 866 6457',
    'servicioalcliente@sajivet.com',
    'https://sajimx.com/',
    '24 horas, 365 días',
    NULL,
    ST_SetSRID(ST_MakePoint(-116.9345, 32.4873), 4326)::geography,
    NULL, false
  ),

  (
    'vet_clinic', 'hours_24',
    'Hospital de Mascotas SAJI — Gabilondo',
    'Av. Guillermo Prieto 2960, Col. Gabilondo, C.P. 22044, Tijuana, B.C.',
    '+52 664 866 6457',
    'servicioalcliente@sajivet.com',
    'https://sajimx.com/',
    '24 horas, 365 días',
    NULL,
    ST_SetSRID(ST_MakePoint(-117.0080, 32.5180), 4326)::geography,
    NULL, false
  ),

  (
    'vet_clinic', 'hours_24',
    'Dr. Zoo Hospital Veterinario',
    'Paseo del Centenario 60, Loc. 2, Col. Zona Urbana Río, C.P. 22010, Tijuana, B.C.',
    '+52 664 682 8540',
    'hospitalveterinario@drzoo.mx',
    'https://www.drzoo.mx/',
    '24 horas, 7 días',
    NULL,
    ST_SetSRID(ST_MakePoint(-117.024409, 32.535840), 4326)::geography,
    NULL, false
  ),

-- ---------------------------------------------------------------------------
-- VET CLINICS — EMERGENCY
-- ---------------------------------------------------------------------------

  (
    'vet_clinic', 'emergency',
    'EMEVET Clínica Veterinaria',
    'Blvd. Alberto Limón Padilla 9000, Plaza Mercado 45, Col. Mesa de Otay, C.P. 22450, Tijuana, B.C.',
    '+52 664 624 5971',
    'emergenciasvet@hotmail.com',
    'https://www.emevet.com.mx/',
    'Lun-Sáb 7:00-0:00, Dom 9:00-14:00 (emergencias 24h)',
    NULL,
    ST_SetSRID(ST_MakePoint(-116.9420, 32.5410), 4326)::geography,
    NULL, false
  ),

-- ---------------------------------------------------------------------------
-- VET CLINICS — STANDARD
-- ---------------------------------------------------------------------------

  (
    'vet_clinic', 'standard',
    'Otay Vet — Clínica Veterinaria y Estética',
    'Blvd. Lázaro Cárdenas 1908, Col. Otay Constituyentes, Tijuana, B.C.',
    '+52 664 623 7999',
    NULL,
    'https://www.otayvet.com/',
    'Lun-Vie 9:00-18:00, Sáb 9:00-17:00',
    NULL,
    ST_SetSRID(ST_MakePoint(-116.9710, 32.5350), 4326)::geography,
    NULL, false
  );

-- =============================================================================
-- Add location to jurisdiction_authorities for existing government entries
-- =============================================================================

UPDATE jurisdiction_authorities
SET
  location = ST_SetSRID(ST_MakePoint(-116.90734765, 32.46195376), 4326)::geography,
  address = 'Blvd. Insurgentes S/N, Col. Meseta del Chema, C.P. 22225, Tijuana, B.C.'
WHERE dependency_name ILIKE '%Control Animal%'
  AND location IS NULL;

-- =============================================================================
-- Backfill jurisdiction_id from geometry containment
-- =============================================================================

UPDATE points_of_interest
SET jurisdiction_id = (
  SELECT id FROM jurisdictions
  WHERE ST_Contains(geometry::geometry, points_of_interest.location::geometry)
  LIMIT 1
)
WHERE jurisdiction_id IS NULL;
