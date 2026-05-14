require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import your schemas
const User = require('./models/User');
const Campaign = require('./models/Campaign');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔌 Connected to MongoDB Atlas!'))
  .catch((err) => console.error('🚨 MongoDB connection error:', err));


// ==========================================
//               API ROUTES
// ==========================================

// 1. REGISTRATION ROUTE
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "A scholar with this email already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPlayer = new User({ username, email, password: hashedPassword });
    const savedPlayer = await newPlayer.save();
    
    res.status(201).json({ 
      message: "Character forged successfully!", 
      player: { id: savedPlayer._id, username: savedPlayer.username } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration." });
  }
});

// 2. LOGIN ROUTE (This is what went missing!)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const player = await User.findOne({ email });
    
    if (!player) {
      return res.status(400).json({ message: "No scholar found with this email." });
    }

    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    res.status(200).json({ 
      message: "Login successful!", 
      player: { id: player._id, username: player.username, level: player.level, hp: player.current_hp } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
});

// 3. AI DUNGEON MASTER ROUTE (Generate Map)
app.post('/api/campaigns/generate', async (req, res) => {
  try {
    const { userId, syllabusText } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const systemInstruction = `
      ROLE: You are an expert AI Game Master and Educational Syllabus Parser. 
      TASK: Convert the provided academic syllabus text into a structured RPG campaign map.
      INSTRUCTIONS:
      1. Parse text into Modules ('Regions').
      2. Sub-topics become 'Quests'.
      3. Final module concept becomes the 'Boss Fight'.
      4. Assign 'xp_reward' (50 for basic, 200+ for advanced).
      5. Establish 'prerequisites' (quest_ids required before unlocking).
      OUTPUT FORMAT: Return ONLY valid JSON. Do not use markdown blocks.
      SCHEMA:
      {
        "campaign_name": "Course Name",
        "total_regions": 1,
        "regions": [{
          "region_name": "Unit Name", "region_order": 1,
          "quests": [{"quest_id": "q1", "quest_name": "Topic", "description": "RPG desc", "xp_reward": 50, "prerequisites": []}],
          "boss_fight": {"boss_name": "Final Topic", "description": "RPG desc", "xp_reward": 500, "weakness": "Study tip"}
        }]
      }
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log("🧙‍♂️ AI is analyzing the syllabus...");
    const result = await model.generateContent(syllabusText);
    const campaignData = JSON.parse(result.response.text());
    
    campaignData.user_id = userId;

    const newCampaign = new Campaign(campaignData);
    const savedCampaign = await newCampaign.save();

    console.log(`🗺️ Map Saved for User ${userId}`);
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "The Dungeon Master failed to create the map." });
  }
});

// 4. FETCH PLAYER'S MAP ROUTE
app.get('/api/campaigns/:userId', async (req, res) => {
  try {
    const campaign = await Campaign.find({ user_id: req.params.userId });
    if (!campaign) {
      return res.status(404).json({ message: "No map found." });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve the map." });
  }
});


// 5. AI ACTIVE RECALL QUIZ ROUTE (The Boss Fight)
app.post('/api/quests/quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const systemInstruction = `
      ROLE: You are a strict but fair AI Professor and Game Master.
      TASK: Generate a 3-question multiple-choice quiz about the specific topic provided to test a student's active recall.
      OUTPUT FORMAT: Return ONLY a valid JSON array. Do not use markdown blocks.
      SCHEMA:
      [
        {
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The exact string of the correct option"
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log(`🧠 Generating Boss Fight Quiz for: ${topic}...`);
    // Ask Gemini to generate the quiz based on the specific topic sent from React
    const result = await model.generateContent(`Generate a quiz for this topic: ${topic}`);
    const quizData = JSON.parse(result.response.text());
    
    res.status(200).json(quizData);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ message: "The Dungeon Master is busy preparing other traps. Try again later." });
  }
});

// 6. AWARD XP & LEVEL UP ROUTE
app.put('/api/users/:id/xp', async (req, res) => {
  try {
    const { xpGained, questName} = req.body;
    
    // 1. Find the player
    const player = await User.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found." });

    // 2. Add the XP
    player.current_xp += xpGained;
    player.daily_xp += xpGained;

    // --- NEW: Add the quest to their completed list if it isn't already there ---
    if (questName && !player.completed_quests.includes(questName)) {
      player.completed_quests.push(questName);
    }

    // 3. RPG Logic: Every 1000 XP = 1 Level!
    const newLevel = Math.floor(player.current_xp / 1000) + 1;
    
    let leveledUp = false;
    if (newLevel > player.level) {
      player.level = newLevel;
      player.max_hp += 50; // Grant them more health on level up!
      player.current_hp = player.max_hp;
      leveledUp = true;
    }

    await player.save();

    res.status(200).json({ 
      message: "XP Awarded!", 
      player, 
      leveledUp 
    });

  } catch (error) {
    console.error("XP Error:", error);
    res.status(500).json({ message: "Failed to update player stats." });
  }
});


// 7. FETCH PLAYER STATS & CHECK MIDNIGHT RESET
app.get('/api/users/:id', async (req, res) => {
  try {
    const player = await User.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found." });

    // --- THE MIDNIGHT CHECKER ---
    const today = new Date().toDateString(); // Gets a simple string like "Sun May 10 2026"
    
    // If the last reset was NOT today, it means midnight has passed!
    if (player.last_reset !== today) {
      player.daily_xp = 0;       // Drain the daily bar
      player.last_reset = today; // Update the clock
      await player.save();       // Save the reset to the database
    }

    res.status(200).json(player);
  } catch (error) {
    res.status(500).json({ message: "Failed to access mainframe data." });
  }
});

// --- DELETE A DIRECTIVE (QUEST) ---
app.delete('/api/campaigns/:campaignId/quests/:questName', async (req, res) => {
  try {
    const { campaignId, questName } = req.params;
    
    // Find the active campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Database not found." });

    // Loop through all regions and filter out the quest that matches the name
    campaign.regions.forEach(region => {
      region.quests = region.quests.filter(q => q.quest_name !== questName);
    });

    // Save the updated campaign back to MongoDB
    await campaign.save();
    
    // Return the fresh campaign to the frontend
    res.status(200).json(campaign);
  } catch (error) {
    console.error("Failed to purge directive:", error);
    res.status(500).json({ message: "Server error during deletion." });
  }
});


// --- START THE SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});