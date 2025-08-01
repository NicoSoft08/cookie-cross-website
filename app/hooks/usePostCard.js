import { useEffect, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext";
import { IconAvatar } from "../config";
import { faBalanceScale, faBan, faClone, faExclamationTriangle, faFlag, faGavel, faQuestionCircle, faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
import { postService } from "../services/posts";
import { formatPostedAt } from "../func";

export const usePostCard = (post, onPostClick, onProfileClick, onToggleFavorite, className) => {
    const { currentUser } = useAuth();
    // États
    const [currentImage, setCurrentImage] = useState(post.images[0] || IconAvatar);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [imageError, setImageError] = useState(false);

    // Refs
    const cardRef = useRef(null);
    const reportRef = useRef(null);
    const imageIntervalRef = useRef(null);

    // Effet pour le carrousel d'images au survol
    useEffect(() => {
        if (isHovered && post.images.length > 1) {
            imageIntervalRef.current = setInterval(() => {
                setCurrentImageIndex(prev => {
                    const nextIndex = (prev + 1) % post.images.length;
                    setCurrentImage(post.images[nextIndex]);
                    return nextIndex;
                });
            }, 1500);
        } else {
            if (imageIntervalRef.current) {
                clearInterval(imageIntervalRef.current);
            }
            // Revenir à la première image
            if (!isHovered && post.images.length > 0) {
                setCurrentImageIndex(0);
                setCurrentImage(post.images[0]);
            }
        }

        return () => {
            if (imageIntervalRef.current) {
                clearInterval(imageIntervalRef.current);
            }
        };
    }, [isHovered, post.images]);

    // Gestionnaires d'événements
    const handlePostClick = (url) => {
        if (post.isActive && onPostClick) {
            onPostClick(url);
        }
    };

    const handleProfileClick = (url) => {
        if (onProfileClick) {
            onProfileClick(url);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    };

    const handleToggleFavorite = () => {
        if (post.isActive && onToggleFavorite) {
            onToggleFavorite(post.post_id);
        }
    };

    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
            setCurrentImage(IconAvatar);
        }
    };

    const reportReasons = [
        {
            id: 1,
            label: 'Contenu inapproprié',
            icon: faBan,
            action: () => handleReportWithReason(post.id,
                'Contenu inapproprié'
            )
        },
        {
            id: 2,
            label: 'Produit illégal',
            icon: faGavel,
            action: () => handleReportWithReason(post.id,
                'Produit illégal'
            )
        },
        {
            id: 3,
            label: 'Annonce frauduleuse',
            icon: faExclamationTriangle,
            action: () => handleReportWithReason(post.id,
                'Annonce frauduleuse'
            )
        },
        {
            id: 4,
            label: 'Violation des règles du site',
            icon: faBalanceScale,
            action: () => handleReportWithReason(post.id,
                'Violation des règles du site'
            )
        },
        {
            id: 5,
            label: 'Produit contrefait',
            icon: faClone,
            action: () => handleReportWithReason(post.id,
                'Produit contrefait'
            )
        },
        {
            id: 6,
            label: 'Informations trompeuses',
            icon: faQuestionCircle,
            action: () => handleReportWithReason(post.id,
                'Informations trompeuses'
            )
        },
    ];

    const options = [
        {
            label: 'Signaler l\'annonce',
            icon: faFlag,
            action: () => handleReportAd(post.id)
        },
        {
            label: 'Partager',
            icon: faShareFromSquare,
            action: () => handleShareAd(post.PostID)
        },
    ];

    const handleReportWithReason = async (postID, reasonLabel) => {
        if (!currentUser) {
            setToast({
                show: true,
                type: 'error',
                message: 'Vous devez être connecté pour signaler une annonce.'
            });
            return;
        };

        try {
            const result = await postService.reportPost(postID, reasonLabel);

            if (result.success) {
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Votre signalement a été envoyé avec succès.'
                });
                setReportSuccess(true);
            } else {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Une erreur est survenue lors du signalement de l\'annonce.'
                });
                setReportSuccess(false);
            }
            setShowReportModal(false);
        } catch (error) {
            console.error('Erreur lors du signalement de l\'annonce :', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Une erreur est survenue lors du signalement de l\'annonce.'
            });
        }
    };

    const handleReportAd = () => {
        setShowReportModal(true);
        setShowMenu(false);
    };

    const handleShareAd = async (PostID) => {
        const shareLink = `${window.location.origin}/posts/${post.category}/${post.subcategory}/${PostID}`;

        try {
            // More captivating title and text
            await navigator.share({
                title: '✨ Annonce exceptionnelle sur AdsCity! ✨',
                text: '🔥 J\'ai trouvé cette offre incroyable que vous devez absolument voir! Cliquez pour découvrir tous les détails.',
                url: shareLink
            }).then(async () => {
                const postID = post.id;
                const userID = currentUser?.uid;
                if (!userID) return null;
                await postService.updateShareCount(postID, userID);
            });

            await navigator.clipboard.writeText(shareLink);
            setToast({
                show: true,
                type: 'success',
                message: 'Le lien a été copié dans le presse-papiers.'
            });
        } catch (error) {
            console.error('Erreur lors de la copie dans le presse-papiers :', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Une erreur est survenue lors de la copie du lien dans le presse-papiers.'
            });
        }
    };

    return {
        cardRef,
        post,
        handleMouseEnter,
        handleMouseLeave,
        handleImageError,
        handleProfileClick,
        formatPostedAt,
        handleMenuClick,
        handleToggleFavorite,
        reportSuccess,
        reportRef,
        options,
        reportReasons,
        showReportModal,
        currentImage,
        currentImageIndex,
        setShowReportModal,
        toast,
        setToast,
        handlePostClick,
    }
}