import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import TestAuthCycle from './pages/TestAuthCycle';

function App() {
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
