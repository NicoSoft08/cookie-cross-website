import { ChevronLeft, ChevronRight, MessageCircle, SquarePlus } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Avatar from "../../components/ui/Avatar";
import { useEffect, useState } from "react";
import FormData from "../../components/FormData";
import { Spinner } from "react-activity";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import { formatSmartDate } from "../../utils";
import { categoryService } from "../../services/categories";
import { storeService } from "../../services/stores";
import { useAuth } from "../../contexts/AuthContext";
import '../../styles/public/ListingDetails.scss';

const ImageSlider = ({ images = [] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    if (!images || images.length === 0) {
        return <div className="image-placeholder">Image non disponible</div>;
    }

    const parseThumb = (img, type = 'original') => {
        try {
            return JSON.parse(img.thumbnails)?.[type];
        } catch {
            return img.url; // fallback
        }
    };

    const currentImage = parseThumb(images[activeIndex], 'original');

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div
            className="image-slider"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="main-image">
                {isHovered && (
                    <button className="nav-button left" onClick={handlePrev}>
                        <ChevronLeft size={18} />
                    </button>
                )}

                <img src={currentImage} alt={`Img ${activeIndex + 1}`} />

                {isHovered && (
                    <button className="nav-button right" onClick={handleNext}>
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>

            <div className="thumbnails">
                {images.map((img, index) => {
                    const thumb = parseThumb(img, 'original');
                    return (
                        <img
                            key={img.id}
                            src={thumb}
                            alt={`Miniature ${index + 1}`}
                            className={index === activeIndex ? 'active' : ''}
                            onClick={() => setActiveIndex(index)}
                        />
                    );
                })}
            </div>

            <div className="dots">
                {images.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function ListingDetails() {
    const { currentUser } = useAuth();
    const [follow, setFollow] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const { title } = useParams();
    const locate = useLocation();
    const { data } = locate.state;

    const { details, location, images, store } = data;

    useEffect(() => {
        loadCategoriesData();
    }, []);

    const loadCategoriesData = async () => {
        const res = await categoryService.getCategories();
        if (res.success) {
            setCategories(res.data?.categoriesData);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return setToast({
            show: true,
            type: 'error',
            message: 'Veuillez saisir un message.'
        });
    }

    const formatCategorization = () => {
        let category = "";
        let subcategory = "";

        if (data.category) {
            const categoryData = categories.find(cat => cat.categoryName === data.category);
            if (categoryData) category = categoryData.categoryTitle;
        }

        if (data.subcategory) {
            const categoryData = categories.find(cat => cat.categoryName === data.category);
            if (categoryData) {
                const subcategoryData = categoryData.subcategories.find(subcat => subcat.sousCategoryName === data.subcategory);
                if (subcategoryData) subcategory = subcategoryData.sousCategoryTitle;
            }
        }

        return { category, subcategory };
    };

    const { category, subcategory } = formatCategorization();

    const handleFollowStore = async () => {
        // Vérifier si l'utilisateur est connecté
        if (!currentUser) {
            setToast({
                show: true,
                type: 'error',
                message: "Vous devez être connecté pour suivre cette boutique."
            });
            return;
        }

        // Logique pour suivre la boutique
        const res = await storeService.followStore(
            store.id,
            localStorage.getItem('accessToken')
        );

        if (!res.success) {
            setToast({
                show: true,
                type: 'error',
                message: "Une erreur s'est produite lors du suivi de la boutique."
            });
            return;
        }

        setToast({
            show: true,
            type: 'success',
            message: "Vous suivez maintenant cette boutique."
        });
        const storeFollowed = localStorage.setItem('storeFollowed', JSON.stringify(store));
        console.log('Store followed:', storeFollowed);
        setFollow(true);
    }

    const predefinedMessages = [
        "Bonjour, votre annonce m'intéresse. Est-elle toujours disponible ?",
        "Pouvez-vous me donner plus de détails sur l'annonce ?",
        "Est-il possible de négocier le prix ?",
        "Où et quand puis-je voir l'article en personne ?",
    ];

    return (
        <div className="listing-details">

            <ImageSlider images={images} />

            <div className="display">

                <div className='under_score'>
                    <div className='title'>
                        <span>{title}</span>
                        <p>
                            <FaLocationDot className='icon' /> {location.city}, {location.country}
                            <FaRegCalendarAlt className='icon' /> {formatSmartDate(data.createdAt)}
                        </p>
                    </div>
                    <div className='seperator' />
                    <div className='price'>
                        <span>{details.price_type}</span>
                        <p>{details.price} CFA</p>
                    </div>
                </div>

                {details.isSold && <span className="sold-badge">VENDU</span>}

                <div className="content">
                    <div className='detail-section'>
                        <section className="details">
                            <h2>Caractéristiques</h2>
                            <FormData details={details} />
                        </section>

                        <section className="description">
                            <h2>Description</h2>
                            <p>{details.description}</p>
                        </section>

                        <section className="location">
                            <h2>Localisation</h2>
                            <p>{location.address}, {location.city}, {location.country}</p>
                        </section>

                        <section className="meta-info">
                            <h2>Informations supplémentaires</h2>
                            <ul>
                                <li><strong>Catégorie :</strong> {category}</li>
                                <li><strong>Sous-catégorie :</strong> {subcategory}</li>
                            </ul>
                        </section>
                    </div>

                    <div className='owner-card'>
                        <div className='owner-image'>
                            <Avatar src={store.avatar} name={store.name} size="xl" />

                        </div>
                        <Link to={`/stores/${store.slug}`} state={{ data: store }}>
                            <h2 className='name'>{store.name}</h2>
                        </Link>

                        {store.followers.length === 0 ? null : store.followers.length > 1 ? (
                            <p className="like-count">{store.followers.length} abonnés</p>
                        ) : (
                            <p className="like-count">{store.followers.length} abonné</p>
                        )}

                        {store.likes.length > 1 ? (
                            <p className="like-count">{store.likes.length} personnes aiment cette boutique</p>
                        ) : (
                            <p className="like-count">{store.likes.length} personne aime cette boutique</p>
                        )}

                        <div className="store-actions">
                            <button className="btn message">
                                <MessageCircle size={16} />
                                Message
                            </button>

                            <button className="btn subscribe" onClick={handleFollowStore}>
                                {follow ? (
                                    <span className="followed">Suivi</span>
                                ) : (
                                    <>
                                        <SquarePlus size={16} />
                                        Suivre
                                    </>
                                )}
                            </button>
                        </div>
                        {/* <p className='review'>{profilData.ratings?.total || 0} ⭐ {profilData.reviews?.totalReviews || 0} avis</p> */}
                        {/* <div className='action-buttons'>
                            <button className='message' onClick={handleContact}>
                                Ecrire un message
                                <FontAwesomeIcon icon={faEnvelope} className='icon' />
                            </button>
                        </div> */}

                        {/* {isBottomSheetOpen && (
                            <BottomSheet
                                isOpen={isBottomSheetOpen}
                                onClose={closeBottomSheet}
                                sellerData={profilData}
                                adData={post}
                                unreadMessagesCount={conversations.length}
                            />
                        )} */}
                    </div>
                </div>

                <div className="message-to-advertiser">
                    <label htmlFor="message-textarea">✉️ Écrire à la boutique :</label>

                    <div className="predefined-messages">
                        {predefinedMessages.map((msg, index) => (
                            <button key={index} onClick={() => setMessage(msg)}>
                                {msg}
                            </button>
                        ))}
                    </div>

                    <div className="form-group">
                        <textarea
                            id="message-textarea"
                            placeholder="Tapez votre message ici..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                        ></textarea>
                        <button className='send' onClick={handleSendMessage} disabled={loading || !message.trim()}>
                            {loading ? <Spinner variant="bounce" size={10} color="#6c757d" /> : "Envoyer"}
                        </button>
                    </div>
                </div>
            </div>
            <div className="pubs"></div>
        </div>
    );
};
