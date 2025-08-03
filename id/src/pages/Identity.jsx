import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:3001';

export default function Identity() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | authed | unauthenticated | error
    const [error, setError] = useState(null);

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
                    setStatus('authed');
                } else {
                    setStatus('unauthenticated');
                }
            } catch (err) {
                setError('Impossible de vérifier la session.');
                setStatus('error');
            }
        };
        fetchWhoami();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
            setProfile(null);
            setStatus('unauthenticated');
        } catch {
            setError('Échec de la déconnexion.');
        }
    };

    if (status === 'loading') return <div>Vérification de la session...</div>;
    if (status === 'unauthenticated') {
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
                <h1>Identité</h1>
                <p>Tu n'es pas connecté.</p>
                <a href={AUTH_URL}>Se connecter</a>
            </div>
        );
    }
    if (status === 'error') return <div>Erreur : {error}</div>;

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Mon profil</h1>
            {user && (
                <div style={{ marginBottom: 16 }}>
                    <strong>Session utilisateur :</strong>
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
            )}
            {profile ? (
                <div style={{ marginBottom: 16 }}>
                    <strong>Détails du profil :</strong>
                    <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>
            ) : (
                user && <div>Chargement du profil…</div>
            )}
            <button onClick={handleLogout}>Se déconnecter</button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </div>
    );
};
