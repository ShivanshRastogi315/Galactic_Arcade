import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [campaign, setCampaign] = useState(null);
  const [syllabusInput, setSyllabusInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [isFighting, setIsFighting] = useState(false);
  const [activeQuestName, setActiveQuestName] = useState('');
  
  // --- NEW: Tracking Answers and XP ---
  const [activeQuestXp, setActiveQuestXp] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXp, setPlayerXp] = useState(0);

  const navigate = useNavigate();
  const scholarName = localStorage.getItem('scholarName');
  const scholarId = localStorage.getItem('scholarId');

  useEffect(() => {
    if (!scholarId) return navigate('/login');

    const fetchCampaign = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/campaigns/${scholarId}`);
        if (response.ok) {
          const data = await response.json();
          setCampaign(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaign();
  }, [scholarId, navigate]);


  // --- NEW: The Logout Logic ---
  const handleLogout = () => {
    // 1. Clear the player's data from the browser
    localStorage.removeItem('scholarName');
    localStorage.removeItem('scholarId');
    
    // 2. Teleport them back to the login screen
    navigate('/login');
  };

  const handleGenerateMap = async () => {
    if (!syllabusInput.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: scholarId, syllabusText: syllabusInput }),
      });
      if (response.ok) setCampaign(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: Now we also pass the XP reward so we know what it's worth! ---
  const handleStartQuest = async (questName, xpReward) => {
    setIsFighting(true);
    setActiveQuestName(questName);
    setActiveQuestXp(xpReward);
    setSelectedAnswers({}); // Clear old answers
    
    try {
      const response = await fetch('http://localhost:5000/api/quests/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: questName }),
      });
      
      if (response.ok) setActiveQuiz(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsFighting(false);
    }
  };

  // --- NEW: Track when a user clicks a radio button ---
  const handleAnswerSelect = (questionIndex, answerText) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerText });
  };

  // --- NEW: The Grading & XP Logic ---
  const handleCompleteQuest = async () => {
    let correctCount = 0;
    
    // 1. Grade the quiz
    activeQuiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    // 2. Calculate XP (e.g. 2/3 correct = 66% of the total XP reward)
    const accuracy = correctCount / activeQuiz.length;
    const xpEarned = Math.floor(activeQuestXp * accuracy);

    // 3. Send the XP to the database!
    if (xpEarned > 0) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${scholarId}/xp`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpGained: xpEarned }),
        });
        
        const data = await response.json();
        
        if (data.leveledUp) {
          alert(`🎉 LEVEL UP! You are now Level ${data.player.level}!`);
        } else {
          alert(`⚔️ Victory! You answered ${correctCount}/${activeQuiz.length} correctly and earned ${xpEarned} XP!`);
        }
        
        // Update local stats for the UI
        setPlayerLevel(data.player.level);
        setPlayerXp(data.player.current_xp);
        
      } catch (err) {
        console.error("Failed to save XP", err);
      }
    } else {
      alert("💀 Defeat... You didn't get any correct. Study and try again!");
    }

    closeQuiz();
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setActiveQuestName('');
    setActiveQuestXp(0);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '20px' }}>⏳ Summoning the Dungeon Master...</div>;

  if (!campaign) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h2>Welcome, {scholarName}! 🛡️</h2>
        <p>Paste your course syllabus below to generate your campaign map.</p>
        <textarea rows="10" value={syllabusInput} onChange={(e) => setSyllabusInput(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        <button onClick={handleGenerateMap} style={{ padding: '15px 20px', marginTop: '20px', backgroundColor: '#673ab7', color: 'white', border: 'none', cursor: 'pointer' }}>✨ Generate AI Campaign</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', position: 'relative' }}>
      
      
      {/* --- NEW: The Logout Button --- */}
      <button 
        onClick={handleLogout}
        style={{ position: 'absolute', top: '0px', right: '0px', padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
      >
        🚪 Leave Realm
      </button>


      {/* THE BATTLE MODAL */}
      {(isFighting || activeQuiz) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#d32f2f' }}>⚔️ Encounter: {activeQuestName}</h2>
            
            {isFighting ? (
              <p>⏳ The Dungeon Master is formulating your trial...</p>
            ) : (
              <div>
                <p>Answer these 3 questions to conquer this topic! Reward: {activeQuestXp} XP</p>
                {activeQuiz.map((q, i) => (
                  <div key={i} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <p><strong>Q{i + 1}:</strong> {q.question}</p>
                    {q.options.map((opt, j) => (
                      <div key={j} style={{ marginBottom: '5px' }}>
                        {/* --- NEW: Connect the radio buttons to React State --- */}
                        <input 
                          type="radio" 
                          id={`q${i}_opt${j}`} 
                          name={`question${i}`} 
                          value={opt} 
                          onChange={() => handleAnswerSelect(i, opt)}
                        />
                        <label htmlFor={`q${i}_opt${j}`} style={{ marginLeft: '8px' }}>{opt}</label>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button onClick={closeQuiz} style={{ padding: '10px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Flee Battle</button>
                  {/* --- NEW: Connect Submit button to Grading Logic --- */}
                  <button onClick={handleCompleteQuest} style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Submit Answers</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* THE DASHBOARD HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>🗺️ {campaign.campaign_name}</h1>
        
        

        {/* The Player Stats Card */}
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'inline-block', minWidth: '350px', border: '2px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px' }}>
            <strong>🛡️ {scholarName}</strong>
            <strong>Level {playerLevel}</strong>
          </div>
          
          {/* THE PROGRESS BAR */}
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', height: '24px', overflow: 'hidden', position: 'relative', border: '1px solid #ccc' }}>
            
            {/* The Green Fill (Width is calculated dynamically!) */}
            <div style={{ 
              width: `${(playerXp % 1000) / 10}%`, 
              backgroundColor: '#4CAF50', 
              height: '100%', 
              transition: 'width 0.6s ease-in-out' 
            }}></div>
            
            {/* The Text Overlay */}
            <span style={{ position: 'absolute', width: '100%', textAlign: 'center', top: '0', left: '0', fontSize: '13px', lineHeight: '24px', color: '#333', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
              {playerXp % 1000} / 1000 XP
            </span>
          </div>
          
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888' }}>Lifetime Total: {playerXp} XP</p>
        </div>
      </div>

      {/* THE REGIONS AND QUESTS */}
      {campaign.regions.map((region, index) => (
        <div key={index} style={{ border: '2px solid #333', borderRadius: '10px', padding: '20px', marginBottom: '30px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🏰 Region {region.region_order}: {region.region_name}</h2>

          <h3 style={{ marginTop: '20px' }}>Daily Quests</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {region.quests.map((quest) => (
              <div 
                key={quest.quest_id} 
                onClick={() => handleStartQuest(quest.quest_name, quest.xp_reward)}
                style={{ padding: '15px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '5px', borderLeft: '5px solid #4CAF50', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h4 style={{ margin: '0 0 5px 0' }}>⚔️ {quest.quest_name} <span style={{ float: 'right', color: '#ff9800' }}>✨ {quest.xp_reward} XP</span></h4>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{quest.description}</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#2196F3', fontWeight: 'bold' }}>Click to enter battle! 🛡️</p>
              </div>
            ))}
          </div>

          {/* THE BOSS FIGHT */}
          {region.boss_fight && (
            <div 
              onClick={() => handleStartQuest(region.boss_fight.boss_name, region.boss_fight.xp_reward)}
              style={{ marginTop: '30px', padding: '20px', backgroundColor: '#ffebee', border: '2px solid #f44336', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>🐉 BOSS FIGHT: {region.boss_fight.boss_name}</h3>
              <p style={{ margin: '0 0 10px 0' }}><strong>Lore:</strong> {region.boss_fight.description}</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#555' }}><em>💡 Weakness: {region.boss_fight.weakness}</em></p>
              <h4 style={{ textAlign: 'right', margin: '10px 0 0 0', color: '#d32f2f' }}>✨ {region.boss_fight.xp_reward} XP</h4>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' }}>Click to enter the Boss Arena! ⚔️</p>
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default Dashboard;