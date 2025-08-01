import { useEffect, useState } from "react";
import CreatePostButton from "../../components/posts/CreatePostButton";
import { useAuth } from "../../contexts/AuthContext";
import NotificationToast from "../../components/NotificationToast";
import { urlBase64ToUint8Array } from "../../push-notification";
import { apiService } from "../../services/api";
import Toast from "../../components/ui/Toast";
import PostCard from "../../components/posts/PostCard";
import PostsList from "../../components/posts/PostsList";
import '../../styles/public/Home.scss';
import { schemaService } from "../../services/form-schema";
import Loading from "../../components/ui/Loading";
import InputField from "../../components/ui/InputField";
import { brandService } from "../../services/brand";

export default function Home() {
    const { currentUser } = useAuth();
    // const { store } = useStore();
    const [posts, setPosts] = useState([]);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [notificationRequestVisible, setNotificationRequestVisible] = useState(false);

    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [brands, setBrands] = useState([]);

    const [formData, setFormData] = useState({
        category: '',
        subcategory: "",
        details: {}
    });



    useEffect(() => {
        if (currentUser) {
            // Vérifier si l'utilisateur a déjà accepté les notifications
            if (currentUser.pushNotifications) {
                console.log('✅ Notifications déjà activées pour cet utilisateur');
                return;
            }

            if ('Notification' in window && Notification.permission === 'default') {
                // Afficher le toast si la permission n’a pas encore été demandée
                setNotificationRequestVisible(true);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Chargement en parallèle pour meilleure performance
                const [formRes, brandsRes] = await Promise.all([
                    schemaService.getFormFieldsBySlug('cars'),
                    brandService.getBrandBySlug('cars')
                ]);

                if (!formRes.success) throw new Error('Erreur de chargement du formulaire');
                if (!brandsRes.success) throw new Error('Erreur de chargement des marques');

                setFields(formRes.fields?.fields || []);
                setBrands(brandsRes.data || []);
            } catch (err) {
                setError(err.message);
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setFormData(prev => {
            const updated = { ...prev };

            if (!updated.details) updated.details = {};

            switch (type) {
                case 'checkbox':
                    updated.details[name] = checked
                        ? [...(updated.details[name] || []), value]
                        : (updated.details[name] || []).filter(v => v !== value);
                    break;

                case 'radio':
                    updated.details[name] = value;
                    break;

                default:
                    updated.details[name] = value;
            }

            return updated;
        });
    };


    const handleAccept = async () => {
        const permission = await Notification.requestPermission();
        setNotificationRequestVisible(false);

        if (permission === 'granted') {
            console.log('✅ Notifications autorisées');
            handlePermissionGranted(); // 👉 Appelle la suite du processus
        } else {
            console.log('❌ Notifications refusées');
        }
    };

    const handleReject = () => {
        setNotificationRequestVisible(false);
        console.log('ℹ️ L’utilisateur a rejeté manuellement');
    };

    const handlePermissionGranted = async () => {
        try {
            // Enregistre le service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('🛠️ Service worker enregistré');
            console.log('Service Worker:', registration);

            // Récupère la clé publique VAPID depuis ton backend
            const res = await apiService.getVapidKey();

            if (res.success) {
                console.log('✅ Clé publique VAPID obtenue');

                // Abonnement push
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(res.publicKey),
                });

                console.log('📡 Abonnement push obtenu :', subscription);

                // Envoie au backend pour l'enregistrer
                await apiService.subscribeUser(
                    subscription,
                    localStorage.getItem('accessToken')
                );

                console.log('✅ Abonnement enregistré sur le backend');
            } else {
                console.error('❌ Échec de la récupération de la clé publique VAPID');
            }

        } catch (error) {
            console.error('❌ Erreur lors de l’abonnement push :', error);
        }
    };

    if (loading) return <Loading />

    return (
        <div className="home">
            <h1>Bienvenue sur Adscity, {currentUser?.firstName} {currentUser?.lastName} </h1>

            <CreatePostButton currentUser={currentUser} />

            {notificationRequestVisible && (
                <NotificationToast
                    isVisible={notificationRequestVisible}
                    accept={handleAccept}
                    reject={handleReject}
                />
            )}

            {posts.length === 0 && <span>Aucune annonce</span>}

            {/* {JSON.stringify(currentUser)} */}

            <PostsList>
                {posts.map((post, index) => (
                    <PostCard
                        key={index}
                        listing={post}
                        currentUser={currentUser}
                        setToast={setToast}
                    />
                ))}
            </PostsList>

            <div style={{
                height: '5rem'
            }} />


            {fields.map((field, index) => {
                const { type, name, label, placeholder, options, multiple, required, validation } = field;
                const value = formData.details?.[name] || '';

                return (
                    <InputField
                        key={`${name}-${index}`}
                        type={type}
                        name={name}
                        label={label}
                        placeholder={placeholder}
                        options={type === 'brand' ? brands : options}
                        multiple={multiple}
                        required={required}
                        validation={validation} // Passage de la config de validation
                        value={value}
                        onChange={handleChange}
                        onBlur={(fieldName, error) => {
                            // Mise à jour des erreurs dans le state parent
                            setErrors(prev => ({ ...prev, [fieldName]: error }));
                        }}
                        brands={brands}
                        errors={errors}
                    />
                );
            })}

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div >
    );
};
