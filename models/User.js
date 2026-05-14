const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  current_xp: { type: Number, default: 0 },   // Lifetime XP
  current_hp: { type: Number, default: 100 },
  max_hp: { type: Number, default: 100 },
  
  // --- NEW: Daily Tracking Fields ---
  daily_xp: { type: Number, default: 0 },
  last_reset: { type: String, default: () => new Date().toDateString() },

  // --- NEW: Track which quests are beaten! ---
  completed_quests: { type: [String], default: [] }
});

module.exports = mongoose.model('User', UserSchema);