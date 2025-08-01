import { useEffect, useState } from 'react';
import Loading from '../../../components/ui/Loading';
import { useNavigate } from 'react-router-dom';
import { faExclamationTriangle, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CreatePostFlow from './CreatePostFlow';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/dashboard/CreatePostPage.scss';

export default function CreatePostPage() {
    const { currentUser, userData } = useAuth();

    const [hasPlan, setHasPlan] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            const plan = getUserPlan(userData);
            if (plan) {
                setHasPlan(true);
                setIsLoading(false);
            }
        }
    }, [userData]);

    const getUserPlan = (userData) => {
        if (!userData || !userData?.plans) {
            return null; // Retourne null si les données utilisateur ou les plans sont absents
        }

        // Recherche d'un plan contenant la propriété 'max_photos'
        const userPlan = Object.keys(userData?.plans).find(plan =>
            userData?.plans[plan] !== undefined
        );

        // Si un plan valide est trouvé, retourne le nombre maximal de photos
        return userPlan ? userData?.plans[userPlan] : {};
    };

    if (!isLoading) return <Loading />

    return (
        <div className='create-ad-page'>
            <div className="container">
                {!hasPlan ? (
                    <CreatePostFlow currentUser={currentUser} userData={userData} />
                ) : (
                    <div className="no-plan-message">
                        <div className="alert-message">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon" />
                            <h2>
                                Vous n'avez pas de plan actif
                            </h2>
                            <p>
                                Pour créer une annonce, vous devez avoir un plan actif.
                            </p>
                        </div>
                        <button className="subscribe-button" onClick={() => navigate('/forfait')}>
                            <FontAwesomeIcon icon={faTag} className="button-icon" />
                            Voir les forfaits
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
