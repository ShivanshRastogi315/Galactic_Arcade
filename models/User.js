const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // To be hashed later
  
  // RPG Stats!
  level: { type: Number, default: 1 },
  current_xp: { type: Number, default: 0 },
  max_hp: { type: Number, default: 100 },
  current_hp: { type: Number, default: 100 },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);