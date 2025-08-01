import { createContext, useContext, useEffect, useState } from "react";
import Loading from "../components/ui/Loading";
import { userService } from "../services/users";
import { authService } from "../services/auth";
// import Cookies from 'js-cookie';

// Création du contexte d'authentification
export const AuthContext = createContext();

// Utilisation du contexte pour l'accéder facilement dans les composants
export const useAuth = () => {
    return useContext(AuthContext);
};

// Fournisseur de contexte d'authentification
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [token, setToken] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const accessToken = localStorage.getItem('accessToken');

        const fetchUser = async () => {
            try {
                if (accessToken) {
                    const user = await authService.fetchMe(accessToken);
                    if (isMounted) {
                        setToken(accessToken);
                        setCurrentUser(user);
                        setUserRole(user?.role);
                    }
                } else {
                    setCurrentUser(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Erreur:', error);
                if (isMounted) {
                    setCurrentUser(null);
                    localStorage.removeItem('accessToken');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const updateOnlineStatus = () => {
            const online = navigator.onLine;
            setIsOnline(online);
            if (online) {
                sendHeartbeat(); // Si en ligne, envoyer un "ping"
            }
        };

        const sendHeartbeat = async () => {
            if (!accessToken) return;
            try {
                await userService.sendPresencePing(accessToken); // À implémenter côté backend
                // console.log('Heartbeat envoyé');
            } catch (err) {
                console.error('Erreur envoi heartbeat:', err);
            }
        };

        // Écoute des événements online/offline
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        fetchUser();
        updateOnlineStatus(); // Initialiser

        // Intervalle pour envoyer un "heartbeat" toutes les 30 secondes
        const interval = setInterval(() => {
            if (navigator.onLine) {
                sendHeartbeat();
            }
        }, 30000);

        return () => {
            isMounted = false;
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            clearInterval(interval);
        };
    }, []);

    const refreshToken = async () => {
        try {
            const newToken = await authService.refreshTokenAndSetCookie();
            setToken(newToken);
            const userData = await userService.fetchMe(newToken);
            setUserData(userData);
            return newToken;
        } catch (error) {
            console.error('Erreur refresh token:', error);
            throw error;
        }
    };

    if (loading) return <Loading />;

    // Provide values and functions in the context
    const value = {
        currentUser,
        userData,
        loading,
        userRole,
        token,
        isOnline,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}