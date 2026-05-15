import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceBattleBackground from '../components/SpaceBattleBackground';

const Dashboard = () => {
  // --- NEW: Multi-Campaign State ---
  const [credits, setCredits] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);

  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [syllabusInput, setSyllabusInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [isFighting, setIsFighting] = useState(false);
  const [activeQuestName, setActiveQuestName] = useState('');
  const [activeQuestXp, setActiveQuestXp] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXp, setPlayerXp] = useState(0);
  const [dailyXp, setDailyXp] = useState(0);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const navigate = useNavigate();
  const scholarName = localStorage.getItem('scholarName');
  const scholarId = localStorage.getItem('scholarId');

  useEffect(() => {
    if (!scholarId) return navigate('/login');

    const fetchDashboardData = async () => {
      try {
        const [campaignRes, userRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/campaigns/${scholarId}`),
          fetch(`${import.meta.env.VITE_API_URL}/api/users/${scholarId}`)
        ]);

        if (campaignRes.ok) {
          const campaignData = await campaignRes.json();
          // Ensure we are saving an array of campaigns
          if (Array.isArray(campaignData)) {
            setCampaigns(campaignData);
          } else if (campaignData) {
            setCampaigns([campaignData]); // Fallback if backend sends single object
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setPlayerXp(userData.current_xp || 0);
          setPlayerLevel(userData.level || 1);
          setDailyXp(userData.daily_xp || 0);
          setCompletedQuests(userData.completed_quests || []);
          setCredits(userData.credits || 0);
          setStreak(userData.streak_count || 0);
          setBadges(userData.badges || []);
        }
      } catch (err) {
        console.error("Failed to load terminal data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [scholarId, navigate]);

  const handleGenerateMap = async () => {
    if (!syllabusInput.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/campaigns/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: scholarId, syllabusText: syllabusInput }),
      });
      if (response.ok) {
        const newCampaign = await response.json();
        setCampaigns([...campaigns, newCampaign]); // Add new to list
        setActiveCampaign(newCampaign);            // Auto-open the new one
        setIsCreating(false);                      // Close creation screen
        setSyllabusInput('');                      // Clear input for next time
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuest = async (questName, xpReward) => {
    if (isFighting) return; 
    if (completedQuests.includes(questName)) {
      alert("DATA ALREADY EXTRACTED: You have already conquered this directive.");
      return; 
    }
    setIsFighting(true);
    setActiveQuestName(questName);
    setActiveQuestXp(xpReward);
    setSelectedAnswers({});
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quests/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: questName }),
      });
      if (response.ok) {
        setActiveQuiz(await response.json());
      } else {
        alert("⚠️ The Dungeon Master is currently overwhelmed with requests! Please wait a moment and try again.");
      }
    } catch (err) {
      alert("⚠️ Network error. The mainframe might be offline.");
    } finally {
      setIsFighting(false);
    }
  };

  const handleAnswerSelect = (index, text) => setSelectedAnswers({ ...selectedAnswers, [index]: text });

  const handleCompleteQuest = async () => {
    let correctCount = 0;
    activeQuiz.forEach((q, index) => { if (selectedAnswers[index] === q.answer) correctCount++; });
    const accuracy = correctCount / activeQuiz.length;
    const xpEarned = Math.floor(activeQuestXp * accuracy);

    if (xpEarned > 0) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${scholarId}/xp`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpGained: xpEarned, questName: activeQuestName }), 
        });
        const data = await response.json();
        if (data.leveledUp) alert(`SYSTEM OVERRIDE: LEVEL UP! You are now Level ${data.player.level}!`);
        else alert(`DATA RECOVERED: Extracted ${xpEarned} XP!`);
        
        setPlayerLevel(data.player.level);
        setPlayerXp(data.player.current_xp);
        setDailyXp(data.player.daily_xp);
        setCompletedQuests(data.player.completed_quests || []);
        setCredits(data.player.credits);
        setStreak(data.player.streak_count);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("SYSTEM FAILURE: 0 correct. Reboot your memory banks and try again!");
    }
    closeQuiz();
  };


  // --- NEW: DELETE QUEST FUNCTION ---
  const handleDeleteQuest = async (e, questName) => {
    e.stopPropagation(); // CRITICAL: Stops the user from accidentally starting the quiz when they click delete!

    // Give a final warning before permanently deleting
    if (!window.confirm(`WARNING: Are you sure you want to permanently purge the directive: ${questName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/campaigns/${activeCampaign._id}/quests/${encodeURIComponent(questName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCampaign = await response.json();
        setActiveCampaign(updatedCampaign); // Instantly removes it from the screen
        
        // Updates the background memory so it doesn't reappear if we switch tabs
        setCampaigns(campaigns.map(c => c._id === updatedCampaign._id ? updatedCampaign : c));
      } else {
        alert("SYSTEM ERROR: Failed to purge directive.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Network error. The mainframe might be offline.");
    }
  };

  const closeQuiz = () => { setActiveQuiz(null); setActiveQuestName(''); setActiveQuestXp(0); };
  const handleLogout = () => { localStorage.removeItem('scholarName'); localStorage.removeItem('scholarId'); navigate('/login'); };

  const getRegionProgress = (region) => {
    let allQuestNames = region.quests.map(q => q.quest_name);
    if (region.boss_fight) allQuestNames.push(region.boss_fight.boss_name);
    const completedCount = allQuestNames.filter(name => completedQuests.includes(name)).length;
    const totalCount = allQuestNames.length;
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    return { completedCount, totalCount, percentage };
  };

  const globalTronStyle = { minHeight: '100vh', width: '100%', backgroundColor: 'transparent', color: '#0fe0ff', fontFamily: '"Courier New", Courier, monospace', boxSizing: 'border-box' };

  if (isLoading) return <div style={{ ...globalTronStyle, textAlign: 'center', padding: '100px 20px', fontSize: '24px', textShadow: '0 0 10px #0fe0ff' }}>INITIALIZING NEURAL LINK...</div>;

  return (
    <div style={globalTronStyle}>
      <SpaceBattleBackground />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', paddingTop: '40px', paddingBottom: '100px' }}>
        
        {/* --- GLOBAL HEADER BUTTONS --- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/hangar')} style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 232, 31, 0.1)', color: '#FFE81F', border: '1px solid #FFE81F', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', textShadow: '0 0 5px rgba(255, 232, 31, 0.5)', boxShadow: '0 0 8px rgba(255, 232, 31, 0.2)' }}>
            [ ENTER HANGAR ]
          </button>
          {activeCampaign && (
            <button onClick={() => { setActiveCampaign(null); setSelectedRegion(null); }} style={{ padding: '8px 15px', backgroundColor: 'rgba(15, 224, 255, 0.1)', color: '#0fe0ff', border: '1px solid #0fe0ff', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 0 8px rgba(15,224,255,0.3)' }}>
              [ SWITCH DIRECTIVE ]
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 0, 60, 0.1)', color: '#ff003c', border: '1px solid #ff003c', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 0 5px #ff003c', boxShadow: '0 0 8px rgba(255,0,60,0.3)' }}>
            [ DISCONNECT ]
          </button>
        </div>

        {/* --- PLAYER STATS WIDGET --- */}
        {/* --- PLAYER STATS WIDGET --- */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ backgroundColor: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(4px)', padding: '20px', display: 'inline-block', minWidth: '400px', border: '1px solid #0fe0ff', boxShadow: '0 0 15px rgba(15,224,255,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px', color: '#fff' }}>
              <span>ID: <span style={{ color: '#0fe0ff' }}>{scholarName}</span></span>
              <span>LVL: <span style={{ color: '#00ff41' }}>{playerLevel}</span></span>
            </div>

            {/* NEW: Credits and Streak Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#aaa', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
              <span>CREDITS: <span style={{ color: '#FFE81F', fontWeight: 'bold' }}>{credits} ¤</span></span>
              <span>STREAK: <span style={{ color: '#ff003c', fontWeight: 'bold' }}>{streak} DAYS 🔥</span></span>
            </div>

            <div style={{ width: '100%', backgroundColor: '#000', height: '20px', border: '1px solid #333', position: 'relative' }}>
              <div style={{ width: `${Math.min((dailyXp / 1000) * 100, 100)}%`, backgroundColor: '#00ff41', height: '100%', transition: 'width 0.8s ease-in-out', boxShadow: '0 0 10px #00ff41' }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', color: '#fff', fontWeight: 'bold', mixBlendMode: 'difference' }}>{dailyXp} / 1000 DAILY XP</div>
            </div>
            
            {/* NEW: Badges Display */}
            {badges.length > 0 && (
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {badges.map(badge => (
                  <span key={badge} style={{ fontSize: '10px', backgroundColor: 'rgba(255, 232, 31, 0.1)', color: '#FFE81F', border: '1px solid #FFE81F', padding: '3px 8px', borderRadius: '3px' }}>
                    🏅 {badge.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}
            
          </div>
        </div>

        {/* ========================================= */}
        {/* VIEW 1: CREATE NEW CAMPAIGN (TEXTAREA)    */}
        {/* ========================================= */}
        {isCreating || campaigns.length === 0 ? (
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', backgroundColor: 'rgba(17, 17, 17, 0.9)', padding: '40px', borderRadius: '10px', border: '1px solid #0fe0ff', boxShadow: '0 0 20px rgba(15, 224, 255, 0.2)' }}>
            <h2 style={{ color:'yellow',textShadow: '0 0 40px #0fe0ff', marginBottom: '20px' }}>INITIALIZE NEW PROTOCOL</h2>
            <p style={{ color: '#aaa' }}>Paste raw syllabus data to compile a new simulation.</p>
            <textarea rows="10" value={syllabusInput} onChange={(e) => setSyllabusInput(e.target.value)} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#000', color: '#00ff41', border: '1px solid #333', outline: 'none', fontFamily: 'monospace' }} placeholder="Awaiting data stream..." />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
              {campaigns.length > 0 && (
                <button onClick={() => setIsCreating(false)} style={{ padding: '15px 30px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #555', cursor: 'pointer', fontFamily: 'monospace' }}>ABORT</button>
              )}
              <button onClick={handleGenerateMap} style={{ padding: '15px 30px', width: campaigns.length > 0 ? 'auto' : '100%', backgroundColor: 'transparent', color: '#0fe0ff', border: '2px solid #0fe0ff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px', boxShadow: '0 0 10px rgba(15,224,255,0.4)', transition: 'all 0.3s' }}>COMPILE</button>
            </div>
          </div>
        ) : 

        /* ========================================= */
        /* VIEW 2: CAMPAIGN HUB (SUBJECT SELECTOR)   */
        /* ========================================= */
        !activeCampaign ? (
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', textAlign: 'center', marginBottom: '40px', letterSpacing: '2px', textShadow: '0 0 15px #0fe0ff' }}>// SELECT DIRECTIVE</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
              
              {/* Existing Campaigns */}
              {campaigns.map((camp, index) => (
                <div key={index} onClick={() => setActiveCampaign(camp)} style={{ padding: '30px', backgroundColor: 'rgba(10, 10, 10, 0.85)', border: '1px solid #0fe0ff', cursor: 'pointer', textAlign: 'center', boxShadow: '0 0 15px rgba(15,224,255,0.1)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <h2 style={{ color: '#fff', fontSize: '1.4rem', textShadow: '0 0 8px #0fe0ff' }}>{camp.campaign_name.toUpperCase()}</h2>
                  <p style={{ color: '#00ff41', marginTop: '15px', fontSize: '12px', letterSpacing: '1px' }}>[ ACCESS DATABASE ]</p>
                </div>
              ))}

              {/* Add New Campaign Button */}
              <div onClick={() => setIsCreating(true)} style={{ padding: '30px', backgroundColor: 'rgba(10, 10, 10, 0.5)', border: '1px dashed #666', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0fe0ff'; e.currentTarget.style.color = '#0fe0ff'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.color = '#666'; }}>
                <h2 style={{ fontSize: '2rem', margin: '0', color: 'teal' }}>+</h2>
                <p style={{ marginTop: '10px', fontSize: '12px', letterSpacing: '1px' }}>UPLOAD NEW SYLLABUS</p>
              </div>

            </div>
          </div>
        ) : 

        /* ========================================= */
        /* VIEW 3: ACTIVE CAMPAIGN MAP (ROOT/NODES)  */
        /* ========================================= */
        (
          <div>
            <h1 style={{ fontSize: '2.2rem', color: '#fff', textAlign: 'center', marginBottom: '40px', letterSpacing: '2px', lineHeight: '1.4', textShadow: '0 0 15px #0fe0ff, 0 0 30px #0fe0ff' }}>
              {activeCampaign.campaign_name.toUpperCase()}
            </h1>

            {/* Battle Modal gets rendered here if active */}
            {/* THE BATTLE MODAL */}
            {(isFighting || activeQuiz) && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 5, 10, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                <div style={{ backgroundColor: '#0a0a0a', padding: '30px', border: '2px solid #0fe0ff', boxShadow: '0 0 30px rgba(15, 224, 255, 0.4)', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                  <h2 style={{ color: '#ff003c', textShadow: '0 0 10px #ff003c', borderBottom: '1px solid #333', paddingBottom: '10px' }}>// ENCOUNTER_LOG: {activeQuestName}</h2>
                  {isFighting ? (
                    <p style={{ color: '#00ff41', marginTop: '20px' }}> Processing threat parameters...</p>
                  ) : (
                    <div style={{ marginTop: '20px' }}>
                      <p style={{ color: '#aaa', marginBottom: '20px' }}>DEFEAT FIREWALL TO EXTRACT {activeQuestXp} XP</p>
                      {activeQuiz.map((q, i) => (
                        <div key={i} style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#111', border: '1px solid #333', borderLeft: '3px solid #0fe0ff' }}>
                          <p style={{ color: '#fff', marginBottom: '15px' }}><strong>Q{i + 1}:</strong> {q.question}</p>
                          {q.options.map((opt, j) => (
                            <div key={j} style={{ marginBottom: '8px', color: '#bbb' }}>
                              <input type="radio" id={`q${i}_opt${j}`} name={`question${i}`} value={opt} onChange={() => handleAnswerSelect(i, opt)} style={{ accentColor: '#0fe0ff' }} />
                              <label htmlFor={`q${i}_opt${j}`} style={{ marginLeft: '10px', cursor: 'pointer' }}>{opt}</label>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button onClick={closeQuiz} style={{ padding: '10px 15px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #555', cursor: 'pointer', fontFamily: 'monospace' }}>ABORT</button>
                        <button onClick={handleCompleteQuest} style={{ padding: '10px 20px', backgroundColor: 'rgba(0, 255, 65, 0.1)', color: '#00ff41', border: '1px solid #00ff41', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace', boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}>EXECUTE RESPONSE</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedRegion ? (
              // CHAPTER CARDS (ROOT DIRECTORY)
              <div>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', color: '#888', letterSpacing: '2px' }}>// ROOT_DIRECTORY</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginTop: '30px' }}>
                  {activeCampaign.regions.map((region, index) => {
                    const progress = getRegionProgress(region);
                    const isComplete = progress.percentage === 100;
                    return (
                      <div key={index} onClick={() => setSelectedRegion(region)} style={{ padding: '25px', backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(3px)', border: `1px solid ${isComplete ? '#00ff41' : '#0fe0ff'}`, cursor: 'pointer', position: 'relative', boxShadow: isComplete ? '0 0 15px rgba(0, 255, 65, 0.2)' : '0 0 10px rgba(15,224,255,0.1)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', backgroundColor: isComplete ? '#00ff41' : '#0fe0ff' }}></div>
                        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 15px 0', textShadow: `0 0 8px ${isComplete ? '#00ff41' : '#0fe0ff'}` }}>SEC_{region.region_order}</h2>
                        
                        {/* High Contrast Text Fix applied here */}
                        <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold', height: 'auto', marginBottom: '15px', textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>{region.region_name}</p>
                        
                        <div style={{ marginTop: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                            <span style={{ color: '#bbbbbb', fontWeight: 'bold', letterSpacing: '1px' }}>DATA EXTRACTED</span>
                            <span style={{ color: isComplete ? '#00ff41' : '#0fe0ff', fontWeight: 'bold' }}>{progress.percentage}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#222' }}>
                            <div style={{ width: `${progress.percentage}%`, height: '100%', backgroundColor: isComplete ? '#00ff41' : '#0fe0ff', boxShadow: `0 0 8px ${isComplete ? '#00ff41' : '#0fe0ff'}` }}></div>
                          </div>
                          <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#aaaaaa', textAlign: 'right', fontWeight: 'bold' }}>{progress.completedCount} / {progress.totalCount} DIRECTIVES</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // INSIDE A CHAPTER (NODE VIEW)
              <div>
                <button onClick={() => setSelectedRegion(null)} style={{ marginBottom: '30px', padding: '10px 20px', backgroundColor: 'transparent', color: '#0fe0ff', border: '1px solid #0fe0ff', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '1px' }}>[ &lt;-- RETURN TO ROOT ]</button>
                <div style={{ border: '1px solid #333', padding: '30px', backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(3px)', position: 'relative' }}>
                  <h2 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '15px', letterSpacing: '1px', textShadow: '0 0 8px rgba(255,255,255,0.3)' }}><span style={{ color: '#0fe0ff' }}>SEC_{selectedRegion.region_order} //</span> {selectedRegion.region_name.toUpperCase()}</h2>
                  <div style={{ display: 'grid', gap: '20px', marginTop: '25px' }}>
                    {selectedRegion.quests.map((quest) => {
                      const isDone = completedQuests.includes(quest.quest_name);
                      return (
                        <div key={quest.quest_id} onClick={() => handleStartQuest(quest.quest_name, quest.xp_reward)} style={{ padding: '20px', backgroundColor: isDone ? 'rgba(0, 255, 65, 0.05)' : 'rgba(17, 17, 17, 0.9)', border: '1px solid', borderColor: isDone ? '#00ff41' : '#222', borderLeft: `4px solid ${isDone ? '#00ff41' : '#0fe0ff'}`, cursor: isDone ? 'default' : 'pointer', opacity: isDone ? 0.7 : 1, position: 'relative' }}>
                          
                          {/* --- NEW: THE PURGE BUTTON --- */}
                          <button 
                            onClick={(e) => handleDeleteQuest(e, quest.quest_name)}
                            style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', color: '#ff003c', border: '1px solid #ff003c', cursor: 'pointer', fontSize: '10px', padding: '4px 8px', letterSpacing: '1px', fontFamily: 'monospace', zIndex: 10, transition: 'all 0.2s', textShadow: '0 0 5px rgba(255,0,60,0.5)' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ff003c'; e.currentTarget.style.color = '#000'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ff003c'; }}
                          >
                            [ PURGE ]
                          </button>

                          {/* Updated H4 to add paddingRight so long text doesn't hide behind the button */}
                          <h4 style={{ margin: '0 0 10px 0', color: isDone ? '#00ff41' : '#fff', paddingRight: '80px' }}>
                             {quest.quest_name} 
                            <span style={{ color: isDone ? '#00ff41' : '#0fe0ff', marginLeft: '10px' }}>+{quest.xp_reward} XP</span>
                          </h4>
                          
                          <p style={{ margin: '0', color: '#888', fontSize: '13px' }}>{quest.description}</p>
                          <p style={{ margin: '15px 0 0 0', fontSize: '11px', color: isDone ? '#00ff41' : '#0fe0ff', letterSpacing: '1px' }}>{isDone ? '[ DATA EXTRACTED ]' : '[ INITIATE UPLOAD ]'}</p>
                        </div>
                      )
                    })}
                  </div>
                  {selectedRegion.boss_fight && (() => {
                    const isBossDone = completedQuests.includes(selectedRegion.boss_fight.boss_name);
                    return (
                      <div onClick={() => handleStartQuest(selectedRegion.boss_fight.boss_name, selectedRegion.boss_fight.xp_reward)} style={{ marginTop: '40px', padding: '25px', backgroundColor: isBossDone ? 'rgba(0, 255, 65, 0.05)' : 'rgba(26, 5, 5, 0.9)', border: `1px solid ${isBossDone ? '#00ff41' : '#ff003c'}`, cursor: isBossDone ? 'default' : 'pointer', opacity: isBossDone ? 0.7 : 1 }}>
                        <h3 style={{ margin: '0 0 15px 0', color: isBossDone ? '#00ff41' : '#ff003c', textShadow: `0 0 10px ${isBossDone ? '#00ff41' : '#ff003c'}` }}>{isBossDone ? '✔ THREAT NEUTRALIZED' : `⚠ CRITICAL THREAT: ${selectedRegion.boss_fight.boss_name.toUpperCase()}`}</h3>
                        <p style={{ margin: '0 0 10px 0', color: '#ccc', fontSize: '14px' }}><strong>SIGNATURE:</strong> {selectedRegion.boss_fight.description}</p>
                        <h4 style={{ textAlign: 'right', margin: '15px 0 0 0', color: isBossDone ? '#00ff41' : '#0fe0ff' }}>+{selectedRegion.boss_fight.xp_reward} XP</h4>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;