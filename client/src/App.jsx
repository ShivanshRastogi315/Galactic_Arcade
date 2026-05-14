import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Hangar from './pages/Hangar';
import Landing from './pages/Landing';

// We will build these components next!
// const Login = () => <div><h2>Login Page</h2></div>;
// // const Register = () => <div><h2>Registration Page</h2></div>;
// const Dashboard = () => <div><h2>The Scholar's Quest Map</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation/Header can go here later */}
        
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Distinct User Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* The Main Application */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/hangar" element={<Hangar />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;