import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function Identity() {
    const [user, setUser] = useState(null);
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
                } else {
                    setError('Aucun utilisateur authentifié.');
                }
            } catch (err) {
                setError('Impossible de vérifier la session.');
            }
        };
        fetchWhoami();
    }, []);


    return (
        <div
            className="text-center"
            style={{ textAlign: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}
        >
            <div
                className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto"
                style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', padding: '32px', maxWidth: '800px', margin: '0 auto' }}
            >
                <User
                    className="w-16 h-16 text-orange-500 mx-auto mb-4"
                    style={{ width: '64px', height: '64px', color: '#F97316', marginBottom: '16px' }}
                />
                <h2
                    className="text-2xl font-bold text-gray-900 mb-6"
                    style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', marginBottom: '24px' }}
                >
                    Service d'Identité
                </h2>

                {user ? (
                    <div
                        className="bg-green-50 border border-green-200 rounded-lg p-6"
                        style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderRadius: '8px', padding: '24px' }}
                    >
                        <h3
                            className="text-lg font-semibold text-green-800 mb-4"
                            style={{ fontSize: '20px', fontWeight: '600', color: '#065F46', marginBottom: '16px' }}
                        >
                            ✅ Utilisateur Authentifié
                        </h3>
                        <div
                            className="text-left space-y-2"
                            style={{ textAlign: 'left', lineHeight: '1.5', marginBottom: '16px' }}
                        >
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Nom:</strong> {user.displayName}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </div>
                        <div
                            className="mt-4 text-xs text-green-600 font-mono bg-green-100 p-3 rounded"
                            style={{ marginTop: '16px', fontSize: '12px', color: '#065F46', backgroundColor: '#DCFCE7', padding: '12px', borderRadius: '8px' }}
                        >
                            Session reconnue depuis auth.adscity.net
                        </div>
                    </div>
                ) : (
                    <div
                        className="bg-red-50 border border-red-200 rounded-lg p-6"
                        style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderRadius: '8px', padding: '24px' }}
                    >
                        <h3
                            style={{ fontSize: '20px', fontWeight: '600', color: '#B91C1C', marginBottom: '16px' }}
                            className="text-lg font-semibold text-red-800 mb-4"
                        >
                            ❌ Non Authentifié
                        </h3>
                        <p
                            style={{ lineHeight: '1.5', marginBottom: '16px' }}
                            className="text-red-700 mb-4"
                        >
                            Aucune session valide détectée.
                        </p>
                        <p
                            style={{ fontSize: '14px', color: '#B91C1C' }}
                            className="text-sm text-red-600"
                        >
                            Veuillez vous connecter via auth.adscity.net pour accéder à ce service.
                        </p>
                    </div>
                )}

                <div
                    className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded"
                    style={{ marginTop: '24px', fontSize: '12px', color: '#6B7280', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px' }}
                >
                    <strong>Principe:</strong> Ce service vérifie automatiquement si l'utilisateur est connecté en validant le cookie de session partagé.
                </div>
            </div>
        </div>
    );
};
