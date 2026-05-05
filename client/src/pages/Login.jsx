import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('scholarName', data.player.username);
        localStorage.setItem('scholarId', data.player.id);
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("NETWORK FAILURE: Unable to ping mainframe.");
    }
  };

  // --- GLOBAL THEME WRAPPER ---
  const globalTronStyle = {
    minHeight: '100vh',
    backgroundColor: '#050505',
    color: '#0fe0ff',
    fontFamily: '"Courier New", Courier, monospace',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  };

  return (
    <div style={globalTronStyle}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        backgroundColor: '#0a0a0a', 
        padding: '40px', 
        border: '1px solid #0fe0ff', 
        boxShadow: '0 0 20px rgba(15, 224, 255, 0.2)',
        position: 'relative'
      }}>
        
        {/* Corner Accents */}
        <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '15px', height: '15px', borderTop: '2px solid #0fe0ff', borderLeft: '2px solid #0fe0ff' }}></div>
        <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '15px', height: '15px', borderBottom: '2px solid #0fe0ff', borderRight: '2px solid #0fe0ff' }}></div>

        <h2 style={{ 
          textAlign: 'center', 
          letterSpacing: '3px', 
          marginBottom: '30px',
          // The Text Gradient Magic
          background: 'linear-gradient(90deg, #0fe0ff, #00ff41)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          // Keeping a soft glow behind it
          textShadow: '0 0 15px rgba(15, 224, 255, 0.4)' 
        }}>
          TERMINAL_LOGIN
        </h2>
        
        {error && (
          <div style={{ 
            color: '#ff003c', 
            marginBottom: '20px', 
            padding: '12px', 
            border: '1px solid #ff003c', 
            backgroundColor: '#1a0505', 
            textShadow: '0 0 5px #ff003c',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            // ERR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px', letterSpacing: '1px' }}>TARGET_EMAIL</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#000', 
                color: '#00ff41', 
                border: '1px solid #333', 
                outline: 'none', 
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px', letterSpacing: '1px' }}>SECURITY_KEY</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#000', 
                color: '#00ff41', 
                border: '1px solid #333', 
                outline: 'none', 
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }} 
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '15px', 
              marginTop: '10px', 
              backgroundColor: 'transparent', 
              color: '#0fe0ff', 
              border: '2px solid #0fe0ff', 
              cursor: 'pointer', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              letterSpacing: '2px', 
              boxShadow: '0 0 10px rgba(15,224,255,0.4)', 
              transition: 'all 0.3s' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0fe0ff'; e.currentTarget.style.color = '#000'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0fe0ff'; }}
          >
            INITIATE UPLINK
          </button>
        </form>

        <p style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
          NO ACCESS DELEGATED? <Link to="/register" style={{ color: '#00ff41', textDecoration: 'none', textShadow: '0 0 5px rgba(0, 255, 65, 0.5)', marginLeft: '5px' }}>[ INITIALIZE PROFILE ]</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;