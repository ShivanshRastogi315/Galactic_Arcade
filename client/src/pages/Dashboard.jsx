import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- THE NEW ANIMATED BACKGROUND COMPONENT ---
const SpaceBattleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to fill the screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Game Entities
    const stars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1
    }));

    const player = { x: canvas.width / 2, y: canvas.height - 100, width: 30, height: 40 };
    let lasers = [];
    let enemies = [];
    let particles = [];
    let frame = 0;

    const drawTriangle = (x, y, w, h, color, pointingDown = false) => {
      ctx.beginPath();
      if (pointingDown) {
        ctx.moveTo(x - w / 2, y - h / 2);
        ctx.lineTo(x + w / 2, y - h / 2);
        ctx.lineTo(x, y + h / 2);
      } else {
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x - w / 2, y + h / 2);
        ctx.lineTo(x + w / 2, y + h / 2);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color === '#0fe0ff' ? 'rgba(15, 224, 255, 0.2)' : 'rgba(255, 0, 60, 0.2)';
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    };

    const render = () => {
      // Clear screen with a slight fade effect for motion blur
      ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Automate Player (Sine wave movement)
      player.x = (canvas.width / 2) + Math.sin(frame * 0.02) * (canvas.width / 3);
      drawTriangle(player.x, player.y, player.width, player.height, '#0fe0ff');

      // Player auto-fire
      if (frame % 30 === 0) {
        lasers.push({ x: player.x, y: player.y - player.height, speed: 10 });
      }

      // 3. Update & Draw Lasers
      ctx.strokeStyle = '#00ff41';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff41';
      ctx.lineWidth = 3;
      for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.y -= l.speed;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y - 15);
        ctx.stroke();

        // Remove off-screen lasers
        if (l.y < 0) lasers.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // 4. Spawn & Update Enemies
      if (frame % 100 === 0) {
        enemies.push({ 
          x: Math.random() * canvas.width, 
          y: -50, 
          width: 30, 
          height: 30, 
          speed: Math.random() * 2 + 1 
        });
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;
        drawTriangle(e.x, e.y, e.width, e.height, '#ff003c', true);

        // Simple Collision Check (Laser hits Enemy)
        for (let j = lasers.length - 1; j >= 0; j--) {
          let l = lasers[j];
          if (Math.abs(l.x - e.x) < e.width && Math.abs(l.y - e.y) < e.height) {
            // Explosion particles
            for(let p=0; p<10; p++) {
              particles.push({x: e.x, y: e.y, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 30});
            }
            enemies.splice(i, 1);
            lasers.splice(j, 1);
            break;
          }
        }
        // Remove off-screen enemies
        if (e && e.y > canvas.height) enemies.splice(i, 1);
      }

      // 5. Update Particles
      ctx.fillStyle = '#ff003c';
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) particles.splice(i, 1);
      }
      ctx.globalAlpha = 1.0;

      frame++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Change zIndex from -1 to 0
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
};


// --- YOUR DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [campaign, setCampaign] = useState(null);
  const [syllabusInput, setSyllabusInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [isFighting, setIsFighting] = useState(false);
  const [activeQuestName, setActiveQuestName] = useState('');
  
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

  const handleStartQuest = async (questName, xpReward) => {
    setIsFighting(true);
    setActiveQuestName(questName);
    setActiveQuestXp(xpReward);
    setSelectedAnswers({});
    
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

  const handleAnswerSelect = (questionIndex, answerText) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerText });
  };

  const handleCompleteQuest = async () => {
    let correctCount = 0;
    activeQuiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) correctCount++;
    });

    const accuracy = correctCount / activeQuiz.length;
    const xpEarned = Math.floor(activeQuestXp * accuracy);

    if (xpEarned > 0) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${scholarId}/xp`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpGained: xpEarned }),
        });
        const data = await response.json();
        if (data.leveledUp) {
          alert(`SYSTEM OVERRIDE: LEVEL UP! You are now Level ${data.player.level}!`);
        } else {
          alert(`DATA RECOVERED: You answered ${correctCount}/${activeQuiz.length} correctly and extracted ${xpEarned} XP!`);
        }
        setPlayerLevel(data.player.level);
        setPlayerXp(data.player.current_xp);
      } catch (err) {
        console.error("Failed to save XP", err);
      }
    } else {
      alert("SYSTEM FAILURE: 0 correct. Reboot your memory banks and try again!");
    }
    closeQuiz();
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setActiveQuestName('');
    setActiveQuestXp(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('scholarName');
    localStorage.removeItem('scholarId');
    navigate('/login');
  };

  // --- UPDATED: Made background transparent so the canvas shows through ---
  // --- UPDATED: Explicitly setting the background to transparent ---
  const globalTronStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'transparent', /* THIS IS THE MAGIC FIX */
    color: '#0fe0ff',
    fontFamily: '"Courier New", Courier, monospace',
    boxSizing: 'border-box'
  };

  if (isLoading) return <div style={{ ...globalTronStyle, textAlign: 'center', padding: '100px 20px 20px 20px', fontSize: '24px', textShadow: '0 0 10px #0fe0ff' }}>INITIALIZING NEURAL LINK...</div>;

  if (!campaign) {
    return (
      <div style={globalTronStyle}>
        <SpaceBattleBackground />
        {/* ADDED position and zIndex HERE */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px', margin: '50px auto', textAlign: 'center', backgroundColor: 'rgba(17, 17, 17, 0.9)', padding: '40px', borderRadius: '10px', border: '1px solid #0fe0ff', boxShadow: '0 0 20px rgba(15, 224, 255, 0.2)' }}>
          <h2 style={{ textShadow: '0 0 10px #0fe0ff' }}>TERMINAL ACCESSED: {scholarName}</h2>
          <p style={{ color: '#aaa' }}>No active directives found. Input raw syllabus data to compile simulation.</p>
          <textarea rows="10" value={syllabusInput} onChange={(e) => setSyllabusInput(e.target.value)} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#000', color: '#00ff41', border: '1px solid #333', outline: 'none', fontFamily: 'monospace' }} placeholder="Awaiting data stream..." />
          <button onClick={handleGenerateMap} style={{ padding: '15px 30px', marginTop: '25px', backgroundColor: 'transparent', color: '#0fe0ff', border: '2px solid #0fe0ff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', boxShadow: '0 0 10px rgba(15,224,255,0.4)', transition: 'all 0.3s' }}>COMPILE PROTOCOL</button>
        </div>
      </div>
    );
  }

  return (
    <div style={globalTronStyle}>
      {/* RENDER THE ANIMATION BEHIND EVERYTHING */}
      <SpaceBattleBackground />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: 'rgba(255, 0, 60, 0.1)', color: '#ff003c', border: '1px solid #ff003c', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 0 5px #ff003c', boxShadow: '0 0 8px rgba(255,0,60,0.3)' }}>[ DISCONNECT ]</button>
        </div>

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

        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#fff',marginTop: '20px', marginBottom: '20px', letterSpacing: '2px', lineHeight: '1.4' ,textShadow: '0 0 15px #0fe0ff, 0 0 30px #0fe0ff' }}>
            {campaign.campaign_name.toUpperCase()}
          </h1>
          
          <div style={{ backgroundColor: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(4px)', padding: '20px', display: 'inline-block', minWidth: '350px', border: '1px solid #0fe0ff', boxShadow: '0 0 15px rgba(15,224,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px', color: '#fff' }}>
              <span>ID: <span style={{ color: '#0fe0ff' }}>{scholarName}</span></span>
              <span>LVL: <span style={{ color: '#00ff41' }}>{playerLevel}</span></span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#000', height: '20px', border: '1px solid #333', position: 'relative' }}>
              <div style={{ width: `${(playerXp % 1000) / 10}%`, backgroundColor: '#00ff41', height: '100%', transition: 'width 0.8s ease-in-out', boxShadow: '0 0 10px #00ff41' }}></div>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', color: '#fff', fontWeight: 'bold', mixBlendMode: 'difference' }}>{playerXp % 1000} / 1000 XP</div>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#666', textAlign: 'center' }}>TOTAL DATA COMPILED: {playerXp} XP</p>
          </div>
        </div>

        {campaign.regions.map((region, index) => (
          <div key={index} style={{ border: '1px solid #333', padding: '30px', marginBottom: '40px', backgroundColor: 'rgba(10, 10, 10, 0.85)', backdropFilter: 'blur(3px)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '15px', height: '15px', borderTop: '2px solid #0fe0ff', borderLeft: '2px solid #0fe0ff' }}></div>
            <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '15px', height: '15px', borderBottom: '2px solid #0fe0ff', borderRight: '2px solid #0fe0ff' }}></div>

            <h2 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '15px', letterSpacing: '1px', textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>
              <span style={{ color: '#0fe0ff' }}>SEC_{region.region_order} //</span> {region.region_name.toUpperCase()}
            </h2>

            <h3 style={{ marginTop: '25px', color: '#666', fontSize: '14px', letterSpacing: '2px' }}>AVAILABLE DIRECTIVES</h3>
            <div style={{ display: 'grid', gap: '20px', marginTop: '15px' }}>
              {region.quests.map((quest) => (
                <div key={quest.quest_id} onClick={() => handleStartQuest(quest.quest_name, quest.xp_reward)} style={{ padding: '20px', backgroundColor: 'rgba(17, 17, 17, 0.9)', border: '1px solid #222', borderLeft: '4px solid #0fe0ff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0fe0ff'; e.currentTarget.style.boxShadow = '0 0 15px rgba(15,224,255,0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}> {quest.quest_name} <span style={{ float: 'right', color: '#00ff41' }}>+{quest.xp_reward} XP</span></h4>
                  <p style={{ margin: '0', color: '#888', fontSize: '13px' }}>{quest.description}</p>
                  <p style={{ margin: '15px 0 0 0', fontSize: '11px', color: '#0fe0ff', letterSpacing: '1px' }}>[ INITIATE UPLOAD ]</p>
                </div>
              ))}
            </div>

            {region.boss_fight && (
              <div onClick={() => handleStartQuest(region.boss_fight.boss_name, region.boss_fight.xp_reward)} style={{ marginTop: '40px', padding: '25px', backgroundColor: 'rgba(26, 5, 5, 0.9)', border: '1px solid #ff003c', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,60,0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#ff003c', textShadow: '0 0 10px #ff003c' }}>⚠ CRITICAL THREAT: {region.boss_fight.boss_name.toUpperCase()}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#ccc', fontSize: '14px' }}><strong>SIGNATURE:</strong> {region.boss_fight.description}</p>
                <p style={{ margin: '0', fontSize: '13px', color: '#888' }}><em>// EXPLOIT FOUND: {region.boss_fight.weakness}</em></p>
                <h4 style={{ textAlign: 'right', margin: '15px 0 0 0', color: '#00ff41' }}>+{region.boss_fight.xp_reward} XP</h4>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;