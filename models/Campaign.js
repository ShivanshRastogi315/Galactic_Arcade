const mongoose = require('mongoose');

// 1. The Quest Sub-Schema (The daily study tasks)
const questSchema = new mongoose.Schema({
  quest_id: { type: String, required: true },
  quest_name: { type: String, required: true },
  description: { type: String, required: true },
  xp_reward: { type: Number, default: 50 },
  prerequisites: [{ type: String }], // Array of quest_ids you must clear first
  is_completed: { type: Boolean, default: false } // We add this to track player progress!
});

// 2. The Boss Fight Sub-Schema (The end-of-unit test)
const bossSchema = new mongoose.Schema({
  boss_name: { type: String, required: true },
  description: { type: String, required: true },
  xp_reward: { type: Number, default: 500 },
  weakness: { type: String },
  is_defeated: { type: Boolean, default: false }
});

// 3. The Region Sub-Schema (The Modules/Units)
const regionSchema = new mongoose.Schema({
  region_name: { type: String, required: true },
  region_order: { type: Number, required: true },
  quests: [questSchema],
  boss_fight: bossSchema
});

// 4. The Main Campaign Schema (The full parsed Syllabus)
const campaignSchema = new mongoose.Schema({
  campaign_name: { type: String, required: true },
  total_regions: { type: Number, required: true },
  regions: [regionSchema],
  
  // This links the specific syllabus to a specific user in your database
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);