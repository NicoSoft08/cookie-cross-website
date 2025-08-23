import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import TestAuthCycle from './pages/TestAuthCycle';
import { useEffect } from 'react';

function App() {
  useEffect(() => { document.title = "Auth | AdsCity" }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-auth" element={<TestAuthCycle />} />
        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
