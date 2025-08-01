import { useEffect, useState } from 'react';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Menu, X } from 'lucide-react';
import { storeService } from '../../services/stores';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';
import { subscriptionPlanStorage } from '../../utils/subscriptionPlanStorage';
import '../../styles/public/Stores.scss';

const businessCategory = [
    "Toutes les catégories",
    "Service Automobile",
    "Mode et Vêtements",
    "Arts et Spectacles",
    "Beauté, Cosmétique et Soins Personnels",
    "Éducation",
    "Planificateur d'Événements",
    "Finances",
    "Épicerie",
    "Hôtel",
    "Médical & Santé",
    "Restauration",
    "Achats et Vente au Détail",
    "Immobilier",
    "Électronique et Informatique",
    "Sports et Loisirs",
    "Maison et Jardin",
    "Bricolage et Construction",
    "Services Professionnels",
    "Artisanat",
    "Animalerie et Services pour Animaux",
    "Voyages et Tourisme",
    "Livres et Papeterie",
    "Jouets et Jeux",
    "Agriculture et Élevage",
    "Mobilier et Décoration", 
    "Photographie et Vidéo",
    "Services Juridiques",
    "Transport et Logistique",
    "Musique et Instruments",
    "Bien-être et Fitness",
    "Services à Domicile",
    "Énergie et Environnement",
    "Médias et Communication",
    "Industrie et Fabrication",
    "Associations et Organisations",
    "Autre"
];

const formValidationRules = {
    name: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s]+$/,
        messages: {
            required: "Le nom de la boutique est requis.",
            minLength: "Le nom de la boutique doit comporter au moins 3 caractères.",
            maxLength: "Le nom de la boutique ne doit pas dépasser 50 caractères.",
            pattern: "Le nom de la boutique ne doit contenir que des lettres, des chiffres et des espaces."
        }
    },
    category: {
        required: true,
        messages: {
            required: "La catégorie est requise."
        }
    },
    avatar: {
        required: true,
        messages: {
            required: "Le logo de votre boutique est requis."
        }
    },
    description: {
        required: false,
        maxLength: 500,
        messages: {
            required: "La description est réquise.",
            maxLength: "La description ne doit pas dépasser 500 caractères."
        }
    }
}

const SideBar = ({ currentUser, toggle, onOpen, allStores }) => {
    const hasUserStore = currentUser && currentUser.storeId !== null;
    const userHasStoreName = hasUserStore ? currentUser.store?.name : 'Nom de votre boutique';
    const userStoreSlug = hasUserStore ? currentUser.store?.slug : 'Nom de votre boutique';

    return (
        <aside className={`store-side-bar ${toggle ? 'open' : ''}`}>
            <div className="side-bar-header">
                <h2>Boutiques</h2>
                {hasUserStore ? (
                    <div className="user-store">
                        <Link to={`/stores/${userStoreSlug}`} className="store-link">
                            <img src={currentUser?.store?.avatar} alt={currentUser?.store?.avatar} className="store-img" />
                            <span className='store-name'>{userHasStoreName}</span>
                        </Link>
                    </div>
                ) : (
                    <button className='create-store' onClick={onOpen}>Créer une boutique</button>
                )}
            </div>

            <div className="menu-liked-stores">
                <h3>Boutiques aimées</h3>
                <>
                    {allStores
                        .filter((store) =>
                            store.likes?.some((like) => like.userId === currentUser.id)
                        )
                        .map((store) => (
                            <Link to={`/stores/${store.slug}`} state={{ data: store }}>
                                <div className="menu-item" key={store.id}>
                                    <Avatar name={store.name} src={store.avatar} size='sm' />
                                    <span>{store.name}</span>
                                </div>
                            </Link>
                        ))}
                </>
            </div>
        </aside>
    );
};

const Content = ({ toggle, currentUser, onToggleSidebar, search, handleSearchChange, category, handleCategoryChange, stores, setStores, highlightMatch }) => {
    const [likedStores, setLikedStores] = useState(() => {
        const storedLikes = localStorage.getItem('likedStores');
        return storedLikes ? JSON.parse(storedLikes) : [];
    });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const toggleLike = async (id) => {
        if (!currentUser) {
            setToast({ show: true, message: "Vous devez être connecté pour aimer une boutique.", type: 'error' });
            return;
        }

        const isAlreadyLiked = likedStores.includes(id);

        const res = isAlreadyLiked
            ? await storeService.dislikeStore(id, localStorage.getItem('accessToken'))
            : await storeService.likeStore(id, localStorage.getItem('accessToken'));

        if (res.success) {
            // Met à jour likedStores
            const updatedLikes = isAlreadyLiked
                ? likedStores.filter((storeId) => storeId !== id)
                : [...likedStores, id];

            setLikedStores(updatedLikes);
            localStorage.setItem('likedStores', JSON.stringify(updatedLikes));

            // Met à jour dynamiquement le compteur de likes dans l’état des boutiques
            const updatedStores = stores.map(store => {
                if (store.id === id) {
                    return {
                        ...store,
                        _count: {
                            ...store._count,
                            likes: store._count.likes + (isAlreadyLiked ? -1 : 1),
                        },
                    };
                }
                return store;
            });

            setStores(updatedStores);

            setToast({
                show: true,
                message: isAlreadyLiked ? 'Like retiré.' : 'Boutique aimée.',
                type: 'success',
            });
        } else {
            setToast({ show: true, message: 'Erreur lors de l’opération.', type: 'error' });
        }
    };

    return (
        <div className={`store-content ${toggle ? 'open' : ''}`}>
            <main className="store-content-list">
                <div className="store-content-header">
                    <input
                        type="text"
                        placeholder="Rechercher une boutique..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <select name="category" value={category} onChange={handleCategoryChange}>
                        {businessCategory.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    {/* Icône Menu visible seulement sur petit écran */}
                    <button className="menu-icon" onClick={onToggleSidebar}>
                        <Menu size={24} />
                    </button>
                </div>

                <div className="store-content-grid">
                    {stores.length > 0 ?
                        stores.map(store => {
                            const isLiked = likedStores.includes(store.id);
                            return (
                                <div key={store.id} className="store-content-card">
                                    <Link to={`/stores/${store.slug}`} state={{ data: store }} className="store-content_card">
                                        <img src={store.banner} alt="" className="store-banner" />
                                    </Link>
                                    <div className="store-content_card-info">
                                        <Avatar src={store.avatar} name={store.name} size="sm" />
                                        <div className="info">
                                            <Link to={`/stores/${store.slug}`} state={{ data: store }} className="store-name">
                                                <h3>{highlightMatch(store.name, search)}</h3>
                                            </Link>
                                            <p className="category">{highlightMatch(store.category, search)}</p>
                                            {typeof store._count?.likes === 'number' && store._count.likes > 0 && (
                                                <span className="likes">
                                                    {store._count.likes >= 1000
                                                        ? `${(store._count.likes / 1000).toFixed(1)}K`
                                                        : store._count.likes
                                                    } personnes aiment cette boutique
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className={`like-btn ${isLiked ? 'liked' : ''}`}
                                            onClick={() => toggleLike(store.id)}
                                        >
                                            <Heart size={24} fill={isLiked ? 'red' : 'none'} stroke="red" />
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                        ) : (
                            <div className='search_no-result'>
                                Aucune boutique ne correspond à la recherche.
                            </div>
                        )
                    }
                </div>
            </main >

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: '' })} />
        </div >
    )
}

export default function Stores() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isOpen = location.pathname === '/stores/create';
    const [toggle, setToggle] = useState(false);
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState(businessCategory[0]);
    const [allStores, setAllStores] = useState([]);
    const [stores, setStores] = useState(allStores);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        avatar: null,
        banner: null,
    });

    const [preview, setPreview] = useState({
        avatar: null,
        banner: null,
    });

    useEffect(() => {
        const fetchStores = async () => {
            const res = await storeService.getPublicStores();
            if (res.success) {
                setAllStores(res.data);
                setStores(res.data);
            }
        };

        fetchStores();
    }, [])

    useEffect(() => {
        let filtered = allStores;

        if (search.trim() !== '') {
            filtered = filtered.filter(store =>
                store.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category !== 'Toutes les catégories') {
            filtered = filtered.filter(store => store.category === category);
        }

        setStores(filtered);
    }, [search, category, allStores]);


    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (value === '') {
            setStores(stores);
            return;
        }

        const filteredStores = stores.filter(
            (store) =>
                store.name.toLowerCase().includes(value.toLowerCase()) ||
                store.category.toLowerCase().includes(value.toLowerCase())
        );
        setStores(filteredStores);
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (file) {
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview((prev) => ({
                    ...prev,
                    [name]: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = (value) => {
        if (value === 'avatar') {
            setFormData((prev) => ({ ...prev, avatar: null }));
            setPreview((prev) => ({ ...prev, avatar: null }));
        } else if (value === 'banner') {
            setFormData((prev) => ({ ...prev, banner: null }));
            setPreview((prev) => ({ ...prev, banner: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        for (const field in formValidationRules) {
            const rules = formValidationRules[field];
            const value = formData[field];

            if (rules.required && !value) {
                errors[field] = rules.messages.required;
            } else if (rules.minLength && value.length < rules.minLength) {
                errors[field] = rules.messages.minLength;
            } else if (rules.maxLength && value.length > rules.maxLength) {
                errors[field] = rules.messages.maxLength;
            } else if (rules.pattern && !rules.pattern.test(value)) {
                errors[field] = rules.messages.pattern;
            }
        }

       return errors;
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'avatar' || name === 'banner') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('description', formData.description);
        if (formData.avatar) formDataToSend.append('avatar', formData.avatar);
        if (formData.banner) formDataToSend.append('banner', formData.banner);

        
        const plan = subscriptionPlanStorage.get(); // récupère le plan
        
        if (!plan) {
            setToast({
                show: true,
                type: 'error',
                message: "Veuillez sélectionner un plan avant de créer une boutique.",
            })
        }
        
        setLoading(true);
        
        try {
            const res = await storeService.createStore(
                formDataToSend,
                localStorage.getItem('accessToken')
            );

            if (res.success) {
                console.log('Navigating to checkout with slug:', plan.slug);
                navigate(`/pay/checkout?storeId=${res.data.id}&plan=${plan.slug}`, { replace: true });
                setLoading(false);
                setFormData({
                    name: '',
                    description: '',
                    category: '',
                    avatar: null,
                    banner: null,
                });
                setPreview({
                    avatar: null,
                    banner: null,
                });
                // Réinitialiser les erreurs
                setErrors({});
                setAllStores((prev) => [...prev, res.store]);
            }
        } catch (error) {
            console.error('Erreur lors de la création de la boutique:', error);
            setLoading(false);
        }
    };

    function highlightMatch(text, query) {
        const index = text?.toLowerCase().indexOf(query?.toLowerCase());
        if (index === -1) return text;

        return (
            <>
                {text.slice(0, index)}
                <strong>{text.slice(index, index + query.length)}</strong>
                {text.slice(index + query.length)}
            </>
        );
    }

    return (
        <div className="stores-page">
            <SideBar
                toggle={toggle}
                allStores={allStores}
                setToggle={setToggle}
                currentUser={currentUser}
                onOpen={() => navigate('/stores/create')}
            />
            <Content
                currentUser={currentUser}
                toggle={toggle}
                search={search}
                handleSearchChange={handleSearchChange}
                category={category}
                handleCategoryChange={handleCategoryChange}
                onToggleSidebar={() => setToggle(!toggle)}
                stores={stores}
                setStores={setStores}
                highlightMatch={highlightMatch}
            />
            {isOpen && (
                <>
                    <div className="store-overlay" onClick={() => navigate('/stores')}></div>
                    <div className="create-store-modal">
                        <div className="create-store-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Créer une boutique</h2>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="name">Nom de la boutique</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Catégorie</label>
                                    <select id="category" name="category" value={formData.category} onChange={handleChange}>
                                        {businessCategory.map((category, index) => (
                                            <option key={index} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="error-message">{errors.category}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="banner">Avatar (logo)</label>
                                    <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                                    {preview.avatar && (
                                        <div className="preview">
                                            <img src={preview.avatar} alt="Aperçu Avatar" className="preview-image" />
                                            <button type="button" className="delete-image" onClick={() => handleDeleteImage('avatar')}>
                                                <X icon="delete" size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {errors.avatar && <span className="error-message">{errors.avatar}</span>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="banner">Bannière</label>
                                    <input type="file" id="banner" name="banner" accept="image/*" onChange={handleImageChange} />
                                    {preview.banner && (
                                        <div className="preview">
                                            <img src={preview.banner} alt="Aperçu Bannière" className="preview-image" />
                                            <button type="button" className="delete-image" onClick={() => handleDeleteImage('banner')}>
                                                <X icon="delete" size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
                                    {errors.description && <span className="error-message">{errors.description}</span>}
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={() => navigate('/stores')}>Annuler</button>
                                    <button type="submit" disabled={loading} onClick={handleSubmit} className="submit-button">
                                        {loading ? <Spinner size={16} color='white' /> : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: '' })} />
        </div>
    );
};
