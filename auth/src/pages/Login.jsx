import { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const APP_URL = process.env.REACT_APP_HOME_URL || 'http://localhost:3000';

export default function Login() {
    const [showPsd, setShowPsd] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 1. whoami pour savoir si connecté
    useEffect(() => {
        const fetchWhoami = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/whoami`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await res.json();
                if (res.ok && data.authenticated) {
                    setUser(data.user);
                } else {
                    setError('Aucun utilisateur authentifié.');
                }
            } catch (err) {
                setError('Impossible de vérifier la session.');
            }
        };
        fetchWhoami();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = { email, password };
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await resp.json();
            if (resp.ok) {
                // Login successful
                console.log('Login successful:', data);
                await new Promise(r => setTimeout(r, 100)); // léger délai pour être sûr
                window.location.href = APP_URL;
            } else {
                // Login failed
                console.error('Login failed:', data);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    if (user) {
        return (
            <div
                className="text-center"
                style={{ textAlign: 'center' }}
            >
                <div
                    className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto"
                    style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                >
                    <LogIn
                        className="w-16 h-16 text-green-500 mx-auto mb-4"
                        style={{ width: '64px', height: '64px', color: '#16a34a', marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                    />
                    <h2
                        className="text-2xl font-bold text-gray-900 mb-4"
                        style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}
                    >
                        Authentifié avec succès!
                    </h2>
                    <p
                        className="text-gray-600 mb-4"
                        style={{ color: '#4b5563', marginBottom: '2rem' }}
                    >Bienvenue {user.displayName}</p>
                    <div
                        className="text-xs text-green-600 font-mono bg-green-50 p-3 rounded border border-green-200"
                        style={{ fontSize: '0.75rem', color: '#14532d', backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #bbf7d0' }}
                    >
                        Session partagée sur *.adscity.net
                    </div>
                </div>
            </div>
        );
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
                    Connexion
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
                        {loading ? 'Chargement...' : "Se connecter"}
                    </button>
                </form>

                <div
                    className="mt-4 text-center"
                    style={{ marginTop: '1rem', textAlign: 'center' }}
                >
                    <button
                        onClick={() => window.location.href = '/register'}
                        className="text-green-600 hover:text-green-700 text-sm"
                        style={{ color: '#16a34a', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Pas de compte? S'inscrire
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
