import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HyperspaceBackground from '../components/HyperspaceBackground';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Themed the success alert!
        alert("SYSTEM COMPILED: Entity created successfully. Redirecting to login terminal...");
        navigate('/login'); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("NETWORK FAILURE: Unable to ping mainframe.");
    }
  };

  // --- GLOBAL THEME WRAPPER ---
  // --- STAR WARS / HOLONET THEME ---
  const theme = {
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent', // Transparent to see the hyperspace background
      fontFamily: '"Courier New", Courier, monospace',
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative'
    },
    datapadCard: {
      zIndex: 10, // Keeps the form above the stars
      backgroundColor: 'rgba(10, 10, 10, 0.85)',
      padding: '40px',
      border: '1px solid #333',
      borderTop: '3px solid #0fe0ff', // Jedi Cyan
      borderBottom: '3px solid #ff003c', // Sith Red
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(15, 224, 255, 0.05)',
      position: 'relative',
      backdropFilter: 'blur(5px)'
    },
    title: {
      textAlign: 'center',
      color: '#FFE81F', // Star Wars Yellow
      fontSize: '1.8rem',
      fontWeight: 'bold',
      letterSpacing: '5px',
      marginTop: '0',
      marginBottom: '35px',
      textShadow: '0 0 10px rgba(255, 232, 31, 0.4)',
      textTransform: 'uppercase'
    },
    errorBox: {
      backgroundColor: 'rgba(255, 0, 60, 0.1)',
      color: '#ff003c',
      border: '1px solid #ff003c',
      padding: '12px',
      marginBottom: '20px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      letterSpacing: '1px',
      textShadow: '0 0 5px #ff003c'
    },
    label: {
      display: 'block',
      fontWeight: 'bold',
      color: '#0fe0ff',
      marginBottom: '8px',
      fontSize: '13px',
      letterSpacing: '2px'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '25px',
      border: 'none',
      borderBottom: '2px solid #333',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      color: '#fff',
      fontSize: '16px',
      fontFamily: 'monospace',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    },
    button: {
      width: '100%',
      padding: '15px',
      backgroundColor: 'transparent',
      color: '#FFE81F',
      border: '2px solid #FFE81F',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      boxShadow: '0 0 10px rgba(255, 232, 31, 0.2)',
      transition: 'all 0.3s ease',
      marginTop: '10px'
    },
    footerText: {
      textAlign: 'center',
      marginTop: '35px',
      fontSize: '12px',
      color: '#fd3030',
      letterSpacing: '1px'
    },
    link: {
      color: '#00ff41',
      textDecoration: 'none',
      textShadow: '0 0 5px rgba(0, 255, 65, 0.5)',
      marginLeft: '8px',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={theme.wrapper}>
      <HyperspaceBackground />
      
      <div style={theme.datapadCard}>
        
        {/* Decorative corner lines */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', borderTop: '2px solid #333' }}></div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', borderTop: '2px solid #333' }}></div>

        <h2 style={theme.title}>FORGE IDENTITY</h2>
        
        {error && (
          <div style={theme.errorBox}>
            // ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div>
            <label style={theme.label}>CITIZEN_ALIAS (Username)</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
              style={theme.input} 
              placeholder="Enter your designated alias..."
              onFocus={(e) => { e.target.style.borderBottom = '2px solid #0fe0ff'; e.target.style.boxShadow = '0 2px 5px rgba(15,224,255,0.2)'; }}
              onBlur={(e) => { e.target.style.borderBottom = '2px solid #333'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label style={theme.label}>CITIZEN_ID (Email)</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={theme.input} 
              placeholder="Enter clearance email..."
              onFocus={(e) => { e.target.style.borderBottom = '2px solid #0fe0ff'; e.target.style.boxShadow = '0 2px 5px rgba(15,224,255,0.2)'; }}
              onBlur={(e) => { e.target.style.borderBottom = '2px solid #333'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label style={theme.label}>SECURITY_CODE (Password)</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={theme.input} 
              placeholder="••••••••"
              onFocus={(e) => { e.target.style.borderBottom = '2px solid #ff003c'; e.target.style.boxShadow = '0 2px 5px rgba(255,0,60,0.2)'; }}
              onBlur={(e) => { e.target.style.borderBottom = '2px solid #333'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button 
            type="submit" 
            style={theme.button}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFE81F'; e.currentTarget.style.color = '#000'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFE81F'; }}
          >
            CREATE CITIZEN RECORD
          </button>
        </form>

        <p style={theme.footerText}>
          CONNECTION ALREADY ESTABLISHED? 
          <Link to="/login" style={theme.link}>[ ACCESS HOLONET ]</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;