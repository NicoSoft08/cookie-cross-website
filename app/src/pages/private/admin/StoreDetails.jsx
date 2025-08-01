import { useState } from "react";
import { AlertTriangle, BadgeIcon, Calendar, CheckCircle, Clock, ExternalLink, Heart, Mail, ShoppingBag, User, XCircle } from 'lucide-react';
import Avatar from "../../../components/ui/Avatar";
import { formattedDate } from "../../../utils";
import '../../../styles/admin/StoreDetails.scss';

export default function StoreDetails({ store, currentUserId, onLike }) {
    const [isLiked, setIsLiked] = useState(
        store.likes.some(like => like.userId === currentUserId)
    );
    const [likesCount, setLikesCount] = useState(store.likes.length);

    const handleLike = () => {
        if (onLike) {
            onLike(store.id);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'APPROVED':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    label: 'Approuvé'
                };
            case 'PENDING':
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    label: 'En attente'
                };
            case 'SUSPENDED':
                return {
                    icon: AlertTriangle,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    label: 'Suspendu'
                };
            case 'BANNED':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    label: 'Banni'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    label: 'Inconnu'
                };
        }
    };

    const statusConfig = getStatusConfig(store.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="store-public">
            {/* Store Banner */}
            <div className="store-banner">
                {store.banner && <img src={store.banner} alt={`${store.name} banner`} />}

                {/* Store Avatar Overlay */}
                <div className="store-avatar">
                    <div className="store-avatar-image">
                        {store.avatar && <Avatar src={store.avatar} alt={store.name} size="2xl" />}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="store-header">
                <div className="store-header-info">
                    <div className="store-title">
                        <h1>{store.name}</h1>
                        {store.isVerified && (
                            <div className="store-verified">
                                <CheckCircle size={14} />
                                <span>Vérifié</span>
                            </div>
                        )}
                    </div>

                    <div className="store-meta">
                        <span className="store-category">{store.category}</span>
                        <div className="store-created">
                            <Calendar size={14} />
                            <span>Créé le {formattedDate(store.createdAt)}</span>
                        </div>
                    </div>

                    <div className={`store-status ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                        <StatusIcon size={14} className={statusConfig.color} />
                        <span className={statusConfig.color}>{statusConfig.label}</span>
                    </div>
                </div>

                <button className={`store-like-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                    <span>{likesCount}</span>
                </button>
            </div>

            {/* Description */}
            {store.description && (
                <div className="store-description">
                    <h3>Description</h3>
                    <p>{store.description}</p>
                </div>
            )}

            {/* Stats */}
            <div className="store-stats">
                <div className="stat-box">
                    <div className="stat-value">{store._count.listings}</div>
                    <div className="stat-label">Annonces</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{likesCount}</div>
                    <div className="stat-label">J'aime</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{store.badges.length}</div>
                    <div className="stat-label">Badges</div>
                </div>
            </div>

            {/* Badges */}
            {store.badges.length > 0 && (
                <div className="store-badges">
                    <h3>Badges</h3>
                    <div className="badge-list">
                        {store.badges.map((storeBadge) => (
                            <div
                                key={storeBadge.id}
                                className="badge-item"
                                style={{
                                    backgroundColor: `${storeBadge.badge.color}20`,
                                    borderColor: `${storeBadge.badge.color}40`,
                                    color: storeBadge.badge.color
                                }}
                            >
                                <BadgeIcon size={16} />
                                <span>{storeBadge.badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Owner */}
            <div className="store-owner">
                <h3>
                    <User size={20} />
                    Propriétaire
                </h3>
                <div className="owner-card">
                    <div className="owner-avatar">
                        <Avatar
                            src={store.owner.avatar}
                            name={`${store.owner.firstName} ${store.owner.lastName}`}
                            alt={`${store.owner.displayName}`}
                            size="md"
                        />
                    </div>
                    <div className="owner-info">
                        <h4>{`${store.owner.firstName} ${store.owner.lastName}`}</h4>
                        <div>
                            <Calendar size={14} />
                            <span>Membre depuis {formattedDate(store.owner.createdAt)}</span>
                        </div>
                    </div>
                    <button className="owner-profile-button">
                        <ExternalLink size={16} />
                        Voir le profil
                    </button>
                </div>
            </div>

            {/* CTA */}
            <div className="store-cta">
                <button>
                    <a href={`/stores/${store.slug}`} className="store-visit-link">
                        <ShoppingBag size={18} />
                        Visiter la boutique
                        <ExternalLink size={16} />
                    </a>
                </button>
            </div>
        </div>
    );
};
