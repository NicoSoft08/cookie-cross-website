import './App.css';
import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:3001';

function App() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/whoami`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => setInfo(data))
      .catch((error) => console.error('Error fetching info:', error));
  }, []);

  // useEffect(() => {
  //   fetch(`${API_URL}/api/auth/test-session`, {
  //     method: 'GET',
  //     credentials: 'include', // Include cookies in the request
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => setInfo(data))
  //     .catch((error) => console.error('Error fetching info:', error));
  // }, []);

  return (
    <div className="App"
      style={{
        alignItems: 'center',
        height: '100vh',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div>
        <h1>App</h1>
        <button onClick={() => window.location.href = `${AUTH_URL}`}>Login (simulate)</button>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
