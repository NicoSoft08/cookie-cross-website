import { useState } from 'react';
import { LogIn } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:3001';

export default function Register() {
    const [showPsd, setShowPsd] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = { name, email, password };
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                // Registration successful
                console.log('Registration successful:', data);
                window.location.href = `${AUTH_URL}`; // Redirect to login page
            } else {
                // Registration failed
                console.error('Registration failed:', data);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }

    return (
        <div
            className="max-w-md mx-auto"
            style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
        >
            <div
                className="bg-white rounded-lg shadow-md p-8"
                style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            >
                <LogIn
                    className="w-16 h-16 text-green-500 mx-auto mb-4"
                    style={{ width: '64px', height: '64px', color: '#16a34a', marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                />
                <h2
                    className="text-2xl font-bold text-center text-gray-900 mb-6"
                    style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem', textAlign: 'center' }}
                >
                    Inscription
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}
                        >
                            Nom complet
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.5)' }}
                            placeholder="Votre nom complet"
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.5)' }}
                            placeholder="Votre email"
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}
                        >
                            Mot de passe
                        </label>
                        <input
                            type={showPsd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.5)' }}
                            placeholder="Votre mot de passe"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="showPsd">
                            <input
                                type='checkbox'
                                checked={showPsd}
                                onChange={() => setShowPsd(!showPsd)}
                            />
                            Voir le mot de passe
                        </label>
                    </div>

                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm"
                            style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                        style={{ width: '100%', backgroundColor: '#16a34a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem', transition: 'background-color 0.2s ease-in-out', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Chargement...' : "S'inscrire"}
                    </button>
                </form>

                <div
                    className="mt-4 text-center"
                    style={{ marginTop: '1rem', textAlign: 'center' }}
                >
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-green-600 hover:text-green-700 text-sm"
                        style={{ color: '#16a34a', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Déjà un compte? Se connecter
                    </button>
                </div>

                <div
                    className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded"
                    style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem' }}
                >
                    <strong>Note de dev:</strong> En production, l'authentification se ferait via HTTPS avec des cookies sécurisés partagés sur le domaine *.adscity.net
                </div>
            </div>
        </div>
    )
}

