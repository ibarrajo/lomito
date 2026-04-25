#!/usr/bin/env node
// Subscribes to the realtime broadcast channels populated by the
// notify_cases_changed_trg and notify_case_timeline_changed_trg triggers
// (migrations 20260425005402 and 20260425030655) and prints any messages
// received during a 30-second window.
//
// Run after deploying the migrations to verify the triggers fire and the
// realtime.messages SELECT policy lets the anon role receive case:* topic
// broadcasts. To see messages, perform a real INSERT/UPDATE on cases (or
// case_timeline) via the live web app while this script is running.
//
// Usage:
//   node scripts/smoke-test-broadcast.mjs
//
// Reads SUPABASE_URL + SUPABASE_ANON_KEY from the root .env. If they're
// not set, falls back to EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
// from apps/mobile/.env.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    return Object.fromEntries(
      raw
        .split('\n')
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => {
          const idx = l.indexOf('=');
          return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}

const root = loadEnv(resolve(process.cwd(), '.env'));
const mobile = loadEnv(resolve(process.cwd(), 'apps/mobile/.env'));

const url =
  root.SUPABASE_URL || mobile.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key =
  root.SUPABASE_ANON_KEY ||
  mobile.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL/ANON_KEY in env or .env files');
  process.exit(1);
}

console.log(`Connecting to ${url}`);
const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 10 } },
});

let received = 0;

const publicChannel = supabase
  .channel('cases:public')
  .on('broadcast', { event: 'cases_changed' }, (msg) => {
    received++;
    console.log('[cases:public/cases_changed]', JSON.stringify(msg.payload));
  })
  .subscribe((status) => {
    console.log(`[cases:public] subscribe status: ${status}`);
  });

// Subscribe to a sentinel case-detail topic to confirm the private-channel
// path works end-to-end. In real use, the topic would be case:<actual-id>.
const sampleTopic = 'case:00000000-0000-0000-0000-000000000000';
const privateChannel = supabase
  .channel(sampleTopic, { config: { private: true } })
  .on('broadcast', { event: 'timeline_event' }, (msg) => {
    received++;
    console.log(`[${sampleTopic}/timeline_event]`, JSON.stringify(msg.payload));
  })
  .subscribe((status) => {
    console.log(`[${sampleTopic}] subscribe status: ${status}`);
  });

console.log(
  '\nListening for 30s. Trigger a case INSERT/UPDATE/DELETE (or a timeline event)',
);
console.log('on the live app to see broadcasts arrive.\n');

setTimeout(async () => {
  console.log(`\nReceived ${received} message(s) total.`);
  await publicChannel.unsubscribe();
  await privateChannel.unsubscribe();
  await supabase.removeAllChannels();
  process.exit(0);
}, 30_000);
