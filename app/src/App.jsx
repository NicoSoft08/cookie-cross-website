import './App.css';
import { Home, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:3001';
const ID_URL = process.env.REACT_APP_ID_URL || 'http://localhost:3002';

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
    <div
      className="text-center"
      style={{ textAlign: 'center' }}
    >
      <div
        className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto"
        style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      >
        <Home
          className="w-16 h-16 text-blue-500 mx-auto mb-4"
          style={{ width: '64px', height: '64px', color: '#3b82f6', marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        />
        <h1
          className="text-3xl font-bold text-gray-900 mb-4"
          style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}
        >AdCity - Application Principale</h1>
        <p
          className="text-gray-600 mb-8"
          style={{ color: '#4b5563', marginBottom: '2rem' }}
        >
          Bienvenue sur l'application principale. Utilisez la navigation ci-dessus pour accéder aux différents services.
        </p>

        <div
          className="grid md:grid-cols-2 gap-6"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}
        >
          <div
            className="bg-green-50 p-6 rounded-lg border border-green-200"
            style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}
          >
            <Shield
              className="w-8 h-8 text-green-600 mb-3"
              style={{ width: '32px', height: '32px', color: '#16a34a', marginBottom: '0.75rem' }}
            />
            <h3
              className="text-lg font-semibold text-green-800 mb-2"
              style={{ fontSize: '1.125rem', fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}
            >Service d'Authentification</h3>
            <p
              className="text-green-700 text-sm mb-4"
              style={{ color: '#15803d', fontSize: '0.875rem', marginBottom: '1rem' }}
            >
              Inscrivez-vous ou connectez-vous via auth.adscity.net
            </p>
            <div
              className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded"
              style={{ fontSize: '0.75rem', color: '#14532d', backgroundColor: '#bbf7d0', padding: '0.5rem', borderRadius: '0.25rem' }}
            >
              Domaine: auth.adscity.net
            </div>
          </div>

          <div
            className="bg-orange-50 p-6 rounded-lg border border-orange-200"
            style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}
          >
            <User
              className="w-8 h-8 text-orange-600 mb-3"
              style={{ width: '32px', height: '32px', color: '#c2410c', marginBottom: '0.75rem' }}
            />
            <h3
              className="text-lg font-semibold text-orange-800 mb-2"
              style={{ fontSize: '1.125rem', fontWeight: '600', color: '#7c2d12', marginBottom: '0.5rem' }}
            >Service d'Identité</h3>
            <p
              className="text-orange-700 text-sm mb-4"
              style={{ color: '#9a3412', fontSize: '0.875rem', marginBottom: '1rem' }}
            >
              Vérifiez votre statut de connexion via id.adscity.net
            </p>
            <div
              className="text-xs text-orange-600 font-mono bg-orange-100 p-2 rounded"
              style={{ fontSize: '0.75rem', color: '#7c2d12', backgroundColor: '#fcd34d', padding: '0.5rem', borderRadius: '0.25rem' }}
            >
              Domaine: id.adscity.net
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
