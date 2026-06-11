// AegisAtlas — constants.js | Owner: Shared | Build day: 1
// Purpose: Unified constants across all JavaScript modules
// Key deps: none (pure constants)

// GPS & Pinging
export const PING_INTERVAL_MS = 30_000; // Background task every 30s
export const NO_MOVEMENT_THRESHOLD_MIN = 120; // 120 min no movement = anomaly
export const NO_MOVEMENT_RADIUS_METRES = 20; // All pings within 20m radius
export const LANDMARK_PROXIMITY_METRES = 100; // Nearness threshold for sparkle ring
export const DANGER_WARN_METRES = 200; // Show vignette/toast when within 200m of danger zone

// Zone & Geo
export const ZONE_DENSITY_ALERT_PER_KM2 = 50; // Crowd > 50/km² = upgrade zone to restricted

// XP & Progression
export const XP_PER_PING = 10; // +10 XP per safe-zone ping
export const XP_PER_CHECKIN = 20; // +20 XP per landmark check-in
export const XP_PER_MISSION = 50; // +50 XP per mission completion
export const XP_LEVEL_BASE = 100; // Level 1 requires 100 XP

// Auth & Security
export const JWT_EXPIRY_TOURIST = '8h'; // Tourist token valid 8 hours
export const JWT_EXPIRY_AUTHORITY = '12h'; // Authority token valid 12 hours
export const BCRYPT_COST = 12; // Hashing cost: ~100ms per hash
export const LOGIN_LOCKOUT_ATTEMPTS_AUTHORITY = 5; // Lock after 5 failures
export const LOGIN_LOCKOUT_ATTEMPTS_TOURIST = 10; // Lock after 10 failures
export const LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// UI & Game
export const CAMERA_MODES = ['TOP_DOWN', 'ISOMETRIC'];
export const DAY_START_HOUR = 6; // 6 AM
export const NIGHT_START_HOUR = 18; // 6 PM
export const CHECKIN_WINDOW_HOURS = 4; // Expected check-in every 4 hours

// Level thresholds
export const LEVEL_TITLES = {
  1: 'Explorer',
  6: 'Pathfinder',
  11: 'Guardian',
  21: 'Legend',
};

// Badges
export const BADGES = {
  FIRST_STEPS: { id: 'badge-first-steps', name: 'First Steps', emoji: '👣', condition: 'First GPS ping' },
  ZONE_EXPLORER: { id: 'badge-zone-explorer', name: 'Zone Explorer', emoji: '🗺', condition: 'Visit all 3 risk levels' },
  SAFE_TRAVELLER: { id: 'badge-safe-traveller', name: 'Safe Traveller', emoji: '🛡', condition: '24h no danger zone entry' },
  MISSION_MASTER: { id: 'badge-mission-master', name: 'Mission Master', emoji: '⭐', condition: '5 missions completed' },
  THREE_DAY_STREAK: { id: 'badge-three-day-streak', name: '3-Day Streak', emoji: '🔥', condition: 'App opened 3 consecutive days' },
  HERITAGE_HUNTER: { id: 'badge-heritage-hunter', name: 'Heritage Hunter', emoji: '🏰', condition: '3 heritage site check-ins' },
  FOODIE_QUEST: { id: 'badge-foodie-quest', name: 'Foodie Quest', emoji: '🍜', condition: '3 food spot check-ins' },
  NIGHT_OWL: { id: 'badge-night-owl', name: 'Night Owl', emoji: '🦉', condition: 'Check-in after 8 PM' },
  SPEED_RUNNER: { id: 'badge-speed-runner', name: 'Speed Runner', emoji: '⚡', condition: '3 missions in 1 day' },
};

// Character animation timings (ms)
export const CHAR_WALK_DURATION = 500; // Leg swing cycle
export const CHAR_BREATHE_DURATION = 2000; // Standing breathe
export const CHAR_TREMBLE_DURATION = 150; // Danger trembling
export const CHAR_BOB_DISTANCE = 3; // translateY max (pixels)

// Camera animation
export const CAMERA_TRANSITION_MS = 400; // ease-in-out

// Alert escalation delays
export const ALERT_NUDGE_DELAY_MS = 0; // Immediate nudge message
export const ALERT_FAMILY_DELAY_MS = 30 * 60 * 1000; // 30 min after nudge
export const ALERT_POLICE_DELAY_MS = 60 * 60 * 1000; // 60 min after family alert

// Landmarks
export const LANDMARKS = {
  HERITAGE: { emoji: '🏰', category: 'Heritage Site' },
  FOOD: { emoji: '🍜', category: 'Food Spot' },
  MUSEUM: { emoji: '🏛️', category: 'Museum' },
  PARK: { emoji: '🌳', category: 'Park / Nature' },
  RELIGIOUS: { emoji: '🕌', category: 'Religious Site' },
  MARKET: { emoji: '🛍️', category: 'Market / Bazaar' },
  POLICE: { emoji: '🚨', category: 'Police Post' },
  HOTEL: { emoji: '🏨', category: 'Hotel' },
};
