import { Link } from 'react-router-dom';
import CyberNexusBackground from '../components/CyberNexusBackground';

const Landing = () => {
  const features = [
    { 
      title: "COMPILE CAMPAIGNS", 
      desc: "Paste your raw syllabus data. Our AI architect will instantly generate a multi-stage galactic map tailored to your subject.", 
      color: "#0fe0ff" // Cyan
    },
    { 
      title: "DEFEAT FIREWALLS", 
      desc: "Engage in active recall. Test your knowledge against adaptive AI bosses to extract data and secure victory.", 
      color: "#ff003c" // Red
    },
    { 
      title: "UPGRADE YOUR FLEET", 
      desc: "Every correct answer earns Credits. Visit the Hangar to unlock heavy cruisers, interceptors, and custom HoloNet themes.", 
      color: "#FFE81F" // Yellow
    },
    { 
      title: "FORGE DISCIPLINE", 
      desc: "Maintain daily streaks and earn exclusive veteran badges. Consistency is the key to dominating the leaderboards.", 
      color: "#00ff41" // Green
    }
  ];

  return (
    <div style={{ minHeight: '100vh', fontFamily: '"Courier New", Courier, monospace', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      
      {/* --- THE INTERACTIVE PARALLAX BACKGROUND --- */}
      <CyberNexusBackground />

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* --- NAVBAR --- */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0fe0ff', letterSpacing: '3px', textShadow: '0 0 10px rgba(15,224,255,0.5)' }}>
            // GALACTIC ARCADE
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/login" style={{ padding: '10px 20px', color: '#aaa', textDecoration: 'none', border: '1px solid transparent', transition: 'all 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>
              [ LOGIN ]
            </Link>
            <Link to="/register" style={{ padding: '10px 20px', backgroundColor: 'rgba(255, 232, 31, 0.1)', color: '#FFE81F', border: '1px solid #FFE81F', textDecoration: 'none', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '0 0 10px rgba(255, 232, 31, 0.2)', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFE81F'; e.currentTarget.style.color = '#000'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 232, 31, 0.1)'; e.currentTarget.style.color = '#FFE81F'; }}>
              INITIALIZE PROFILE
            </Link>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <div style={{ textAlign: 'center', padding: '100px 0 80px 0' }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 6vw, 5rem)', 
            fontWeight: '900', 
            letterSpacing: '4px', 
            textTransform: 'uppercase', 
            margin: '0 0 30px 0',
            lineHeight: '1.2', /* <-- THIS IS THE MAGIC FIX FOR THE OVERLAP */
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}>
            <span style={{ color: '#fccc0b', textShadow: '0 0 15px rgba(255, 255, 255, 0.4)' }}>
              GAMIFY YOUR
            </span>
            <span style={{ color: '#FFE81F', textShadow: '0 0 30px rgba(255, 232, 31, 0.6)' }}>
              INTELLIGENCE...
            </span>
          </h1>

          <p style={{ color: '#ccc', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Stop reading boring textbooks. Orbital Study Command transforms your class syllabus into a living, breathing space-combat RPG. Learn faster, earn credits, and build your fleet.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '18px 40px', backgroundColor: '#0fe0ff', color: '#000', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(15, 224, 255, 0.6)', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
              START MISSION
            </Link>
          </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div style={{ padding: '40px 0 100px 0' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '2rem', letterSpacing: '3px', marginBottom: '50px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
            // MISSION PROTOCOLS
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ backgroundColor: 'rgba(10, 10, 10, 0.85)', padding: '40px 30px', borderTop: `3px solid ${feature.color}`, borderBottom: '1px solid #222', borderLeft: '1px solid #222', borderRight: '1px solid #222', backdropFilter: 'blur(5px)', transition: 'transform 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ color: feature.color, fontSize: '2rem', marginBottom: '20px', textShadow: `0 0 10px ${feature.color}` }}>0{index + 1}</div>
                <h3 style={{ color: '#fff', margin: '0 0 15px 0', letterSpacing: '1px' }}>{feature.title}</h3>
                <p style={{ color: '#888', lineHeight: '1.6', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- FOOTER --- */}
        <footer style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#555', fontSize: '0.9rem' }}>
          <p>SYSTEM UPLINK SECURE. // ORBITAL STUDY COMMAND © {new Date().getFullYear()}</p>
        </footer>

      </div>
    </div>
  );
};

export default Landing;