import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HyperspaceBackground from '../components/HyperspaceBackground';

// Hardcoded Shop Inventory
const SHOP_ITEMS = {
  ships: [
    { id: 'x-wing', name: 'T-65 X-WING (HEAVY)', cost: 0, desc: 'Standard issue heavy fighter. 4x blasters.' },
    { id: 'falcon', name: 'YT-1300 FREIGHTER', cost: 1500, desc: 'Fastest ship in the fleet. Wide hull.' },
    { id: 'jedi-starfighter', name: 'DELTA-7 INTERCEPTOR', cost: 3000, desc: 'Ultra-sleek, rapid-fire capabilities.' },
    { id: 'tie-fighter', name: 'CAPTURED TIE-FIGHTER', cost: 'LOCKED', desc: 'Achieve the DATA MASTER badge to unlock.' }
  ],
  themes: [
    { id: 'jedi-cyan', name: 'JEDI ARCHIVE (CYAN)', cost: 0, color: '#0fe0ff' },
    { id: 'sith-red', name: 'SITH INQUISITOR (RED)', cost: 2000, color: '#ff003c' },
    { id: 'mandalorian-beskar', name: 'MANDALORIAN (SILVER)', cost: 5000, color: '#c0c0c0' },
    { id: 'veteran-gold', name: 'VETERAN COMMAND (GOLD)', cost: 'LOCKED', color: '#FFD700' }
  ]
};

const Hangar = () => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const scholarId = localStorage.getItem('scholarId');

  useEffect(() => {
    if (!scholarId) return navigate('/login');
    fetch(`import.meta.env.VITE_API_URL/api/users/${scholarId}`)
      .then(res => res.json())
      .then(data => { setPlayer(data); setIsLoading(false); })
      .catch(err => console.error(err));
  }, [scholarId, navigate]);

  const handleTransaction = async (type, item, action) => {
    try {
      const res = await fetch(`import.meta.env.VITE_API_URL/api/users/${scholarId}/hangar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, itemName: item.id, cost: item.cost, action })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setPlayer(updatedUser);
      } else {
        const error = await res.json();
        alert(`TRANSACTION FAILED: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderShopItem = (item, type) => {
    const isUnlocked = type === 'ship' ? player.unlocked_ships.includes(item.id) : player.unlocked_themes.includes(item.id);
    const isActive = type === 'ship' ? player.active_ship === item.id : player.active_theme === item.id;
    const accentColor = type === 'theme' ? item.color : '#0fe0ff';

    return (
      <div key={item.id} style={{ padding: '20px', backgroundColor: 'rgba(10, 10, 10, 0.85)', border: `1px solid ${isActive ? accentColor : '#333'}`, position: 'relative' }}>
        <h3 style={{ margin: '0 0 10px 0', color: isActive ? accentColor : '#fff' }}>{item.name}</h3>
        {item.desc && <p style={{ fontSize: '12px', color: '#888', margin: '0 0 15px 0' }}>{item.desc}</p>}
        {type === 'theme' && <div style={{ width: '100%', height: '10px', backgroundColor: item.color, marginBottom: '15px', boxShadow: `0 0 10px ${item.color}` }}></div>}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#FFE81F', fontWeight: 'bold' }}>{item.cost === 0 ? 'FREE' : `${item.cost} ¤`}</span>
          
          {isActive ? (
            <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px' }}>[ EQUIPPED ]</span>
          ) : isUnlocked ? (
            <button onClick={() => handleTransaction(type, item, 'equip')} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: accentColor, border: `1px solid ${accentColor}`, cursor: 'pointer', fontFamily: 'monospace' }}>EQUIP</button>
          ) : (
            <button onClick={() => handleTransaction(type, item, 'buy')} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: player.credits >= item.cost ? '#FFE81F' : '#555', border: `1px solid ${player.credits >= item.cost ? '#FFE81F' : '#555'}`, cursor: player.credits >= item.cost ? 'pointer' : 'not-allowed', fontFamily: 'monospace' }}>PURCHASE</button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div style={{ color: '#0fe0ff', textAlign: 'center', marginTop: '100px', fontFamily: 'monospace' }}>INITIALIZING HANGAR BAY...</div>;

  return (
    <div style={{ minHeight: '100vh', fontFamily: '"Courier New", Courier, monospace', padding: '40px 20px', position: 'relative' }}>
      <HyperspaceBackground />
      
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', backgroundColor: 'rgba(10,10,10,0.8)', padding: '20px', border: '1px solid #333', borderTop: '3px solid #FFE81F' }}>
          <div>
            <h1 style={{ color: '#FFE81F', margin: 0, textShadow: '0 0 10px rgba(255, 232, 31, 0.5)' }}>FLEET COMMAND HANGAR</h1>
            <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '14px' }}>Upgrade your interface and combat vessels.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#aaa', fontSize: '12px', letterSpacing: '1px' }}>AVAILABLE BALANCE</div>
            <div style={{ color: '#FFE81F', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 232, 31, 0.5)' }}>{player.credits} ¤</div>
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: 'transparent', color: '#0fe0ff', border: '1px solid #0fe0ff', cursor: 'pointer', fontSize: '12px' }}>[ RETURN TO TERMINAL ]</button>
          </div>
        </div>

        {/* Ships Section */}
        <h2 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', letterSpacing: '2px' }}>// COMBAT VESSELS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {SHOP_ITEMS.ships.map(ship => renderShopItem(ship, 'ship'))}
        </div>

        {/* Themes Section */}
        <h2 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px', letterSpacing: '2px' }}>// HOLONET THEMES</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {SHOP_ITEMS.themes.map(theme => renderShopItem(theme, 'theme'))}
        </div>
      </div>
    </div>
  );
};

export default Hangar;