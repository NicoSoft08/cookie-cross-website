import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { storeService } from "../services/stores";
import Loading from "../components/ui/Loading";

// Création du contexte de la boutique
export const StoreContext = createContext();

// Utilisation du contexte pour l'accéder facilement dans les composants
export const useStore = () => {
    return useContext(StoreContext);
};

// Fournisseur de contexte de la boutique
export const StoreProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger automatiquement la boutique de l'utilisateur connecté
    useEffect(() => {
        const fetchStore = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                const res = await storeService.getStoreByUserId(
                    currentUser.id,
                    localStorage.getItem("accessToken")
                );
                if (res.success) {
                    setStore(res.data);
                } else {
                    setStore(null);
                    setError("Aucune boutique trouvée");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Erreur récupération boutique:", err);
                setError("Erreur serveur");
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [currentUser]);

    // if (loading) return <Loading />;

    const value = {
        store,
        loading,
        error,
    }

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};