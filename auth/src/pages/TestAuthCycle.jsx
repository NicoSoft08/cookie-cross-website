// TestAuthCycle.jsx
import { useState } from 'react';

const API_URL = 'http://localhost:4000'; // adapte si besoin

const credentials = {
    email: 'alice@example.com',
    password: 'MySecurePassword123',
    username: 'Alice',
};

export default function TestAuthCycle() {
    const [log, setLog] = useState([]);
    const [running, setRunning] = useState(false);

    const append = (msg) => setLog((l) => [...l, msg]);

    const post = async (url, body) => {
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    };

    const get = async (url) => {
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    };

    const runCycle = async () => {
        if (running) return;
        setRunning(true);
        setLog([]);
        try {
            append('1. Inscription (register)...');
            const reg = await post(`${API_URL}/api/auth/register`, credentials);
            append(`   → status=${reg.status}, ok=${reg.ok}, body=${JSON.stringify(reg.data)}`);

            if (!reg.ok) {
                append('   ✖️ Échec de l’inscription, arrêt du cycle.');
                return;
            }

            append('2. Vérification session via whoami après register...');
            const whoami1 = await get(`${API_URL}/api/auth/whoami`);
            append(`   → status=${whoami1.status}, ok=${whoami1.ok}, body=${JSON.stringify(whoami1.data)}`);

            append('3. Déconnexion (logout)...');
            const logout = await post(`${API_URL}/api/auth/logout`, {}); // body vide
            append(`   → status=${logout.status}, ok=${logout.ok}, body=${JSON.stringify(logout.data)}`);

            append('4. Vérification session via whoami après logout...');
            const whoami2 = await get(`${API_URL}/api/auth/whoami`);
            append(`   → status=${whoami2.status}, ok=${whoami2.ok}, body=${JSON.stringify(whoami2.data)}`);

            append('Cycle terminé.');
        } catch (e) {
            append(`Erreur inattendue: ${e.message}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 16 }}>
            <h2>Test auth cycle : register → whoami → logout → whoami</h2>
            <button onClick={runCycle} disabled={running} style={{ marginBottom: 12 }}>
                {running ? 'En cours...' : 'Lancer le cycle complet'}
            </button>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                {log.length === 0 ? <div>Pas encore exécuté.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <p style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                Remplace `credentials` par un utilisateur existant si tu as déjà un compte, ou adapte l’endpoint si ton
                route est différente. Assure-toi que le backend est en train de tourner et que les cookies sont acceptés
                (vérifie `credentials: 'include'` et CORS côté server avec `credentials: true`).
            </p>
        </div>
    );
}
