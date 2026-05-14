const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  current_xp: { type: Number, default: 0 },   // Lifetime XP
  current_hp: { type: Number, default: 100 },
  max_hp: { type: Number, default: 100 },
  completed_quests: { type: [String], default: [] },

  // --- NEW: ECONOMY & RETENTION ---
  credits: { type: Number, default: 0 }, // Spendable currency!
  streak_count: { type: Number, default: 0 },
  last_active_date: { type: Date, default: null },
  badges: { type: [String], default: [] },

  // --- NEW: CUSTOMIZATION ---
  unlocked_ships: { type: [String], default: ['x-wing'] },
  active_ship: { type: String, default: 'x-wing' },
  unlocked_themes: { type: [String], default: ['jedi-cyan'] },
  active_theme: { type: String, default: 'jedi-cyan' },
  
  // --- NEW: Daily Tracking Fields ---
  daily_xp: { type: Number, default: 0 },
  last_reset: { type: String, default: () => new Date().toDateString() },

  // --- NEW: Track which quests are beaten! ---
  completed_quests: { type: [String], default: [] }
});

module.exports = mongoose.model('User', UserSchema);