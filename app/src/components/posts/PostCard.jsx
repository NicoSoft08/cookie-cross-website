import { Dot, EllipsisVertical, Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBalanceScale, faBan, faClone, faEarthAfrica, faExclamationTriangle,
    faFlag, faGavel, faLock, faQuestionCircle, faShareFromSquare,
    faUserGroup
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatSmartDate } from "../../utils";
import Avatar from "../ui/Avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { postService } from "../../services/posts";
import { IconAvatar } from "../../config";
import '../../styles/posts/PostCard.scss';
import { storeService } from "../../services/stores";

export default function PostCard({ listing, currentUser, setToast }) {
    const [showOptions, setShowOptions] = useState(false);
    const [showReasons, setShowReasons] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [likedListings, setLikedListings] = useState(() => {
        const storedListings = localStorage.getItem('likedListings');
        return storedListings ? JSON.parse(storedListings) : [];
    });

    const [imageError, setImageError] = useState(false);

    const [hovered, setHovered] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const observerRef = useRef();
    const optionsRef = useRef(null);

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
        setCurrentIndex(0); // reset à la première image
    };

    const images = listing.images || [];

    const getImageUrl = (index) => {
        try {
            return JSON.parse(images[index]?.thumbnails || '{}')?.original;
        } catch {
            return null;
        }
    };

    const getAudienceIcon = (audience) => {
        switch (audience) {
            case 'PUBLIC':
                return <FontAwesomeIcon icon={faEarthAfrica} title="Public" />;
            case 'ONLY_ME':
                return <FontAwesomeIcon icon={faLock} title="Moi uniquement" />;
            case 'FOLLOWERS':
                return <FontAwesomeIcon icon={faUserGroup} title="Abonnés uniquement" />;
            default:
                return <FontAwesomeIcon icon={faEarthAfrica} title="Public" />;
        }
    };

    const imageUrl = getImageUrl(currentIndex);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                closeMenus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClickCount = useCallback(async () => {
        if (!currentUser) return null;

        try {
            await postService.incrementClickCount(
                listing.id,
                localStorage.getItem('accessToken')
            );
            observerRef.current?.disconnect();
        } catch (err) {
            console.error('Erreur d’incrémentation des clicks', err);
        }
    }, [listing.id, currentUser]);

    const handleIncreaseStoreVisit = useCallback(async () => {
        if (!currentUser) return null;

        try {
            await storeService.incrementStoreVisit(
                listing.store?.id,
                localStorage.getItem('accessToken')
            );
            observerRef.current?.disconnect();
        } catch (err) {
            console.error('Erreur d’incrémentation des visites', err);
        }
    }, [listing.store, currentUser]);

    const handleViewCount = useCallback(async () => {
        if (!currentUser) return null;

        try {
            await postService.incrementViewCount(
                listing.id,
                localStorage.getItem('accessToken')
            );
            observerRef.current?.disconnect();
        } catch (err) {
            console.error('Erreur d’incrémentation des vues', err);
        }
    }, [listing.id, currentUser]);

    useEffect(() => {
        const cardRef = document.getElementById(`post-card-${listing.id}`);
        if (!cardRef) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    handleViewCount();
                }
            },
            { threshold: [0.5] }
        );

        observerRef.current.observe(cardRef);

        return () => observerRef.current?.disconnect();
    }, [listing.id, handleViewCount]);


    const handleToggleFavorite = async () => {
        if (!currentUser) {
            setToast({
                show: true,
                type: 'error',
                message: "Connectez-vous pour ajouter aux favoris."
            });
            return;
        }

        try {

            const isAlreadyLiked = likedListings.includes(listing.id);

            const res = isAlreadyLiked
                ? await postService.removeFromeFavorite(listing.id, localStorage.getItem('accessToken'))
                : await postService.addToFavorite(listing.id, localStorage.getItem('accessToken'));

            if (res.success) {
                // Met à jour likedStores
                const updatedFavorites = isAlreadyLiked
                    ? likedListings.filter((listingId) => listingId !== listing.id)
                    : [...likedListings, listing.id];

                setLikedListings(updatedFavorites);
                localStorage.setItem('likedListings', JSON.stringify(updatedFavorites));

                setIsFavorite(!isFavorite);
                setToast({
                    show: true,
                    type: 'success',
                    message: isFavorite ? "Retiré des favoris." : "Ajouté aux favoris."
                });
            } else {
                setToast({
                    show: true,
                    type: 'error',
                    message: "Impossible de modifier les favoris."
                });
            }
        } catch (error) {
            console.error("Toggle favorite error:", error);
            setToast({
                show: true,
                type: 'error',
                message: "Impossible de modifier les favoris."
            });
        }
    };

    const toggleOptions = () => setShowOptions(prev => !prev);
    const toggleReasons = () => setShowReasons(prev => !prev);
    const closeMenus = () => {
        setShowOptions(false);
        setShowReasons(false);
    };

    const handleReportListing = () => {
        toggleReasons();
    };

    const handleShareListing = async () => {
        const link = `${window.location.origin}/category/${listing.category}/${listing.subcategory}/listing/${listing.details?.title}`;
        try {
            await navigator.share({
                title: '✨ Annonce exceptionnelle sur AdsCity! ✨',
                text: '🔥 J\'ai trouvé cette offre incroyable que vous devez absolument voir! Cliquez pour découvrir tous les détails.',
                url: link
            }).then(async () => {
                if (!currentUser) return null;
                await postService.updateShareCount(
                    listing.id,
                    localStorage.getItem('accessToken')
                )
            });

            await navigator.clipboard.writeText(link).then(() => {
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Le lien a été copié dans le presse-papiers.'
                });
            })

            closeMenus();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportWithReason = async (id, reason) => {
        const res = await postService.reportListing(
            id,
            localStorage.getItem('accessToken'),
            reason
        );

        if (res.success) {

        }
        console.log(`Report listing ${id} pour raison : ${reason}`);
        closeMenus();
    };

    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
            setCurrentIndex(IconAvatar);
        }
    };

    const audienceIcon = getAudienceIcon(listing.audience);

    const reportReasons = [
        { id: 1, label: 'Contenu inapproprié', icon: faBan },
        { id: 2, label: 'Produit illégal', icon: faGavel },
        { id: 3, label: 'Annonce frauduleuse', icon: faExclamationTriangle },
        { id: 4, label: 'Violation des règles', icon: faBalanceScale },
        { id: 5, label: 'Produit contrefait', icon: faClone },
        { id: 6, label: 'Info trompeuse', icon: faQuestionCircle },
    ];

    const options = [
        { label: "Signaler l'annonce", icon: faFlag, action: handleReportListing },
        { label: "Partager", icon: faShareFromSquare, action: handleShareListing },
    ];

    return (
        <div
            id={`post-card-${listing.id}`}
            className={`post-card ${listing.isActive ? 'active' : 'inactive'} ${listing.isSold ? 'sold' : ''} ${listing.isSponsored ? 'sponsored' : ''} `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >

            {/* Header */}
            <div className="post-card__header">
                <div className="store-info">
                    <Avatar src={listing?.store.avatar} alt={listing?.store.name} size="sm" />
                    <div className="store-details">
                        <div className="store-name-line">
                            <Link
                                className="store-link"
                                to={`/stores/${listing?.store.slug}`}
                                state={{ data: listing.store }}
                                onClick={handleIncreaseStoreVisit}
                            >
                                <h4 className="store-name">{listing?.store.name}</h4>
                            </Link>
                            {/* {hasBadge('verified') && <span className="badge verified">Vérifiée</span>} */}
                            {/* {hasBadge('pro') && <span className="badge pro">Pro</span>} */}
                        </div>
                        <span className="publish-date">
                            {formatSmartDate(listing.createdAt)}
                            <Dot />
                            <span> {audienceIcon} </span>
                        </span>
                    </div>
                </div>

                {/* Menu Trigger */}
                <div className="ellipsis-wrapper" onClick={toggleOptions} ref={optionsRef}>
                    <EllipsisVertical className="ellipsis-icon" />

                    {/* Dropdown principal */}
                    {showOptions && (
                        <div className="dropdown-menu">
                            {options.map((opt, idx) => (
                                <div key={idx} className="dropdown-item" onClick={opt.action}>
                                    <FontAwesomeIcon icon={opt.icon} /> {opt.label}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Sous-menu pour le signalement */}
                    {showReasons && (
                        <div className="dropdown-menu reasons">
                            {reportReasons.map((reason) => (
                                <div
                                    key={reason.id}
                                    className="dropdown-item"
                                    onClick={() => handleReportWithReason(listing.id, reason.label)}
                                >
                                    <FontAwesomeIcon icon={reason.icon} /> {reason.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Body */}
            <div className="post-card__body">
                <Link
                    to={`/category/${listing?.category}/${listing?.subcategory}/listing/${encodeURIComponent(listing?.details?.title)}`}
                    state={{ data: listing }}
                    onClick={handleClickCount}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={listing?.details?.title} className="post-image"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="image-placeholder">Image non disponible</div>
                    )}
                </Link>

                {/* Dots */}
                {hovered && images.length > 1 && (
                    <div className="image-dots">
                        {images.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentIndex ? 'active' : ''}`}
                                onMouseEnter={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                )}

                {/* Bouton Favoris */}
                {hovered && (
                    <button
                        className={`favorite-button ${isFavorite ? 'favorited' : ''} visible`}
                        onClick={() => handleToggleFavorite(listing.id)}
                        aria-label="Ajouter aux favoris"
                    >
                        <Heart
                            className="favorite-icon"
                            fill={isFavorite ? '#e63946' : 'none'}
                            stroke={isFavorite ? '#e63946' : '#777'}
                        />
                    </button>
                )}

                {/* Badges contextuels */}
                <div className="post-status-badges">
                    {listing.isSold && <span className="status-badge sold">Vendu</span>}
                    {!listing.isActive && <span className="status-badge inactive">Inactif</span>}
                    {listing.isSponsored && <span className="status-badge sponsored">Sponsorisé</span>}
                </div>
            </div>

            {/* Footer */}
            <div className="post-card__footer">
                <h3 className="listing-title">{listing?.details?.title}</h3>
                <div className="listing-info">
                    <span className="price">{listing?.details?.price} FCFA</span>
                    <span className="address">{listing?.location?.city}, {listing?.location?.country}</span>
                </div>
            </div>
        </div>
    )
}
