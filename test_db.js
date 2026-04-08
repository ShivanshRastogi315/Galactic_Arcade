require('dotenv').config();
const mongoose = require('mongoose');

// Import the schemas we just created
const User = require('./models/User');
const Campaign = require('./models/Campaign');

const testDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully!');

    // 2. Clear out old test data (so we start fresh each time we run this script)
    await User.deleteMany({});
    await Campaign.deleteMany({});

    // 3. Create a test Player
    const newPlayer = new User({
      username: 'shivu_test',
      email: 'player1@test.com',
      password: 'hashed_password_placeholder' // We will add bcrypt later!
    });
    
    const savedPlayer = await newPlayer.save();
    console.log(`👤 Player Created: ${savedPlayer.username} (Level ${savedPlayer.level}, HP: ${savedPlayer.max_hp})`);

    // 4. Create a test Campaign (Using the AI's exact JSON format)
    const newCampaign = new Campaign({
      campaign_name: "Database Management Systems",
      total_regions: 1,
      user_id: savedPlayer._id, // Magic! This links the map to the player we just made.
      regions: [
        {
          region_name: "Intro to Databases",
          region_order: 1,
          quests: [
            {
              quest_id: "q1",
              quest_name: "File Systems vs DBMS",
              description: "Uncover the ancient debate between fragmented file systems and the organized power of Database Management Systems.",
              xp_reward: 50,
              prerequisites: []
            }
          ],
          boss_fight: {
            boss_name: "Entity-Relationship (ER) Modeling",
            description: "Confront the ultimate challenge of mapping real-world complexities into a structured database design.",
            xp_reward: 500,
            weakness: "Mastering the identification of entities, attributes, and relationships."
          }
        }
      ]
    });

    const savedCampaign = await newCampaign.save();
    console.log(`🗺️ Campaign Saved: ${savedCampaign.campaign_name}`);
    console.log(`🔗 Linked to User ID: ${savedCampaign.user_id}`);

    console.log('🎉 Database test complete! You can view this data in your MongoDB Atlas Collections tab.');
    process.exit(0);

  } catch (error) {
    console.error('🚨 Error testing database:', error);
    process.exit(1);
  }
};

testDatabase();