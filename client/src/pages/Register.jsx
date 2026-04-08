import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // New state to handle error messages from the server
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // --- THE NEW FETCH LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any old errors
    
    try {
      // 1. Send the data to your Express server
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // 2. Parse the server's response
      const data = await response.json();

      // 3. Check if it was successful (Status 201)
      if (response.ok) {
        alert("Character created successfully! Please log in.");
        navigate('/login'); // Send them to the login page
      } else {
        // If the server sends an error (like "Email already exists")
        setError(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to connect to the server. Is it running?");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Create Your Player Profile</h2>
      
      {/* Display error messages if they exist */}
      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', backgroundColor: '#ffe6e6' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Character Name (Username)</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          Forge Character
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have a character? <Link to="/login" style={{ color: '#008CBA' }}>Log in here</Link>.
      </p>
    </div>
  );
};

export default Register;