import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { storeService } from "../../services/stores";
import Loading from "../../components/ui/Loading";
import Avatar from "../../components/ui/Avatar";
import { userService } from "../../services/users";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/ui/Toast";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/Card";
import { MessageCircle, Phone, SquarePlus } from "lucide-react";
import PostCard from "../../components/posts/PostCard";
import '../../styles/public/StoreID.scss';
import { formatNumber } from "../../utils";

export default function StoreID() {
    const { slug } = useParams();
    const locate = useLocation();
    const { currentUser } = useAuth();
    const [store, setStore] = useState(null);
    const [listings, setListings] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState({
        store: true,
        listings: true
    });
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
    const [showNumber, setShowNumber] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [isFollowed, setIsFollowed] = useState(false);

    const { data } = locate.state;
    console.log(data)

    const { avatar, banner, name, id } = data;

    useEffect(() => {
        const raw = localStorage.getItem('storeFollowed');
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                const followed = parsed.some(s => s.id === store?.id);
                setIsFollowed(followed);
            }
        } catch (err) {
            setIsFollowed(false);
        }
    }, [store?.id]);


    // Récupérer les informations de la boutique par son slug
    useEffect(() => {
        const fetchStoreBySlug = async () => {
            try {
                const res = await storeService.getStoreBySlug(slug);
                if (res.success) {
                    setStore(res.data);
                    setLoading({ store: false });
                }
            } catch (error) {
                console.error("Error fetching store:", error);
            }
        };

        fetchStoreBySlug();
    }, [slug]);

    // Récupérer les annonces de la boutique par son id
    useEffect(() => {
        const fetchStoreListingsById = async () => {
            try {
                const res = await storeService.getStoreListings(id);
                if (res.success) {
                    setListings(res.data);
                }
                setLoading({ listings: false });
            } catch (error) {
                console.error("Error fetching listings:", error);
            }
        };

        if (id) {
            fetchStoreListingsById();
        }
    }, [id]);

    useEffect(() => {
        if (store) {
            document.title = `${store.name} - Adscity`;
        }
    }, [store]);

    // Récupérer les informations du propriétaire de la boutique
    useEffect(() => {
        const fetchOwner = async () => {
            const res = await userService.getUserById(store.ownerId);
            if (res.success) {
                setUser(res.data);
            } else {
                setUser(null);
            }
        };

        if (store && store.ownerId) {
            fetchOwner();
        }
    }, [store]);


    const handleShowNumber = () => {
        // Vérifier si le propriétaire a choisi de rendre son numéro de téléphone visible
        if (user?.showPhoneNumber) {
            setToast({
                show: true,
                type: 'info',
                message: "Le propriétaire de cette boutique n'a pas choisi de rendre son numéro de téléphone visible."
            })
            return;
        }

        // Vérifier si l'utilisateur est connecté
        if (!currentUser) {
            setToast({
                show: true,
                type: 'error',
                message: "Vous devez être connecté pour afficher le numéro de téléphone."
            });
            return;
        }

        setShowNumber(true);
    };

    const handleFollowStore = async () => {
        if (!currentUser) {
            return setToast({
                show: true,
                type: 'error',
                message: "Vous devez être connecté pour suivre cette boutique."
            });
        }

        const raw = localStorage.getItem('storeFollowed');
        let followedStores = [];

        try {
            const parsed = JSON.parse(raw);
            followedStores = Array.isArray(parsed) ? parsed : [];
        } catch {
            followedStores = [];
        }

        const alreadyFollowed = followedStores.some(s => s.id === store.id);

        try {
            if (alreadyFollowed) {
                // ✅ UNFOLLOW
                const res = await storeService.unfollowStore(store.id, localStorage.getItem('accessToken'));

                if (!res.success) {
                    return setToast({
                        show: true,
                        type: 'error',
                        message: res.message || "Une erreur s'est produite lors de l'annulation du suivi."
                    });
                }

                // Supprimer du localStorage
                const updated = followedStores.filter(s => s.id !== store.id);
                localStorage.setItem('storeFollowed', JSON.stringify(updated));

                setIsFollowed(false);
                setToast({
                    show: true,
                    type: 'success',
                    message: "Vous ne suivez plus cette boutique."
                });
            } else {
                // ✅ FOLLOW
                const res = await storeService.followStore(store.id, localStorage.getItem('accessToken'));

                if (!res.success) {
                    return setToast({
                        show: true,
                        type: 'error',
                        message: res.message || "Une erreur s'est produite lors du suivi de la boutique."
                    });
                }

                followedStores.push({ id: store.id, name: store.name });
                localStorage.setItem('storeFollowed', JSON.stringify(followedStores));

                setIsFollowed(true);
                setToast({
                    show: true,
                    type: 'success',
                    message: "Vous suivez maintenant cette boutique."
                });
            }
        } catch (err) {
            console.error('Erreur de follow/unfollow:', err);
            setToast({
                show: true,
                type: 'error',
                message: "Erreur réseau. Veuillez réessayer plus tard."
            });
        }
    };

    if (loading.listings && loading.store) return <Loading />

    return (

        <main className="store-public">
            <div className="header-container">
                <Card className="header-card">
                    <CardContent>
                        <img src={banner} alt={name} />
                    </CardContent>
                    <CardFooter className="__footer">
                        <Avatar src={avatar} name={name} size="xl" />
                        <div className="store-meta">
                            <h1>{store.name}</h1>
                            <p>
                                {formatNumber(data.followers.length + (isFollowed ? 1 : 0))}
                                {data.followers.length + (isFollowed ? 1 : 0) > 1 ? ' abonnés' : ' abonné'}
                            </p>
                            <p>{formatNumber(store.likesCount)} {store.likesCount > 1 ? 'personnes aiment cette boutique' : 'personne aime cette boutique'}</p>
                        </div>

                        <div className="store-actions">
                            <button className="btn message">
                                <MessageCircle size={16} />
                                Message
                            </button>
                            <button
                                className="btn show-number"
                                onClick={handleShowNumber} disabled={showNumber}
                            >
                                <Phone size={16} />
                                {showNumber
                                    ? `+${user.phoneNumber}`
                                    : 'Afficher le numéro'
                                }
                            </button>
                            <button className="btn subscribe" onClick={handleFollowStore}>
                                <button className="btn subscribe" onClick={handleFollowStore}>
                                    {isFollowed ? (
                                        <span className="followed">Ne plus suivre</span>
                                    ) : (
                                        <>
                                            <SquarePlus size={16} />
                                            Suivre
                                        </>
                                    )}
                                </button>

                            </button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <section className="store-listings">
                <h1>Publications</h1>
                <Card>
                    <CardHeader>
                        <header className="store-tabs">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={activeTab === 'active'
                                    ? 'active' : ''}
                            >
                                Actives
                                ({listings
                                    .filter(listing => listing.isActive)
                                    .length
                                })
                            </button>
                            <button
                                onClick={() => setActiveTab('archived')}
                                className={activeTab === 'archived'
                                    ? 'active' : ''}
                            >
                                Terminées
                                ({listings
                                    .filter(listing => listing.isActive === false)
                                    .length
                                })
                            </button>
                        </header>
                    </CardHeader>
                    <CardContent>
                        {activeTab === 'active' && (
                            listings.filter(listing => listing.isActive === true).length > 0
                                ? listings
                                    .filter(listing => listing.isActive === true)
                                    .map((listing) => (
                                        <PostCard
                                            key={listing.id}
                                            listing={listing}
                                            currentUser={currentUser}
                                            setToast={setToast}
                                        />
                                    ))
                                : <p>Aucune publication active.</p>
                        )}

                        {activeTab === 'archived' && (
                            listings.filter(listing => listing.isActive === false).length > 0
                                ? listings
                                    .filter(listing => listing.isActive === false)
                                    .map((listing) => (
                                        <PostCard
                                            key={listing.id}
                                            listing={listing}
                                            currentUser={currentUser}
                                            setToast={setToast}
                                        />
                                    ))
                                : <p>Aucune publication terminée.</p>
                        )}
                    </CardContent>
                </Card>
            </section>

            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: '', message: '' })} />
        </main >
    );
};
