import { useEffect, useState } from "react";
import Loading from "../../../components/ui/Loading";
import { useAuth } from "../../../contexts/AuthContext";
import { sessionService } from "../../../services/sessions";
import { AlertCircle, AlertTriangle, Bot, CheckCircle, Clock, Filter, Globe, LogOut, MapPin, Monitor, MoreVertical, RefreshCw, Search, Shield, ShieldAlert, Smartphone, SortDesc, Tablet, Users, Wifi, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import '../../../styles/account/DeviceActivity.scss';

const DeviceSessionModal = ({ session, onClose, onRevoke }) => {
    const {
        browser,
        createdAt,
        id,
        ip,
        country,
        city,
        isBot,
        isMobile,
        isTablet,
        lastUsed,
        os,
        verified
    } = session;

    const getDeviceIcon = () => {
        if (isMobile) return <Smartphone className="modal-device-icon" />;
        if (isTablet) return <Tablet className="modal-device-icon" />;
        return <Monitor className="modal-device-icon" />;
    };

    const formatIP = (ip) => {
        if (ip === '::1') return 'localhost (IPv6)';
        if (ip === '127.0.0.1') return 'localhost (IPv4)';
        return ip;
    };

    const handleRevoke = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir révoquer cette session ?')) {
            try {
                await onRevoke(id);
                onClose();
            } catch (error) {
                console.error('Erreur révocation:', error);
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-section">
                        {getDeviceIcon()}
                        <div>
                            <h3 className="modal-title">{browser}</h3>
                            <p className="modal-subtitle">{os}</p>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X className="close-icon" />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h4 className="section-title">Informations de l'appareil</h4>
                        <div className="detail-grid">
                            <div className="detail-row">
                                <Globe className="detail-icon" />
                                <span className="detail-label">Navigateur</span>
                                <span className="detail-value">{browser}</span>
                            </div>
                            <div className="detail-row">
                                <Monitor className="detail-icon" />
                                <span className="detail-label">Système</span>
                                <span className="detail-value">{os}</span>
                            </div>
                            <div className="detail-row">
                                <Wifi className="detail-icon" />
                                <span className="detail-label">Adresse IP</span>
                                <span className="detail-value">{formatIP(ip)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">Localisation</h4>
                        <div className="detail-grid">
                            <div className="detail-row">
                                <MapPin className="detail-icon" />
                                <span className="detail-label">Emplacement</span>
                                <span className="detail-value">{city}, {country}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">Activité</h4>
                        <div className="detail-grid">
                            <div className="detail-row">
                                <Clock className="detail-icon" />
                                <span className="detail-label">Dernière activité</span>
                                <span className="detail-value">
                                    {formatDistanceToNow(new Date(lastUsed), { locale: fr, addSuffix: true })}
                                </span>
                            </div>
                            <div className="detail-row">
                                <Clock className="detail-icon" />
                                <span className="detail-label">Créée le</span>
                                <span className="detail-value">
                                    {new Date(createdAt).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4 className="section-title">Sécurité</h4>
                        <div className="security-badges">
                            <div className={`security-badge ${verified ? 'verified' : 'unverified'}`}>
                                <Shield className="badge-icon" />
                                {verified ? 'Session vérifiée' : 'Non vérifiée'}
                            </div>
                            <div className={`security-badge ${isBot ? 'danger' : 'success'}`}>
                                {isBot ? <AlertTriangle className="badge-icon" /> : <CheckCircle className="badge-icon" />}
                                {isBot ? 'Bot détecté' : 'Humain'}
                            </div>
                            {isMobile && (
                                <div className="security-badge info">
                                    <Smartphone className="badge-icon" />
                                    Appareil mobile
                                </div>
                            )}
                            {isTablet && (
                                <div className="security-badge info">
                                    <Tablet className="badge-icon" />
                                    Tablette
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-button modal-button--secondary" onClick={onClose}>
                        Fermer
                    </button>
                    <button className="modal-button modal-button--danger" onClick={handleRevoke}>
                        <LogOut className="button-icon" />
                        Révoquer cette session
                    </button>
                </div>
            </div>
        </div>
    );
};


const DeviceSessionCard = ({ onViewDetails, isCurrent, session }) => {
    const [showMenu, setShowMenu] = useState(false);

    const {
        browser,
        device,
        ip,
        country,
        city,
        isBot,
        isMobile,
        isTablet,
        lastUsed,
        os,
        verified
    } = session;


    const deviceType = isBot
        ? 'Bot'
        : isMobile
            ? 'Mobile'
            : isTablet
                ? 'Tablette'
                : 'Ordinateur';

    const getDeviceIcon = () => {
        if (isMobile) {
            return <Smartphone className="device-icon" />;
        }
        if (isTablet) {
            return <Tablet className="device-icon" />;
        }
        return <Monitor className="device-icon" />;
    };

    const getStatusBadge = () => {
        if (isCurrent) {
            return (
                <div className="status-badge status-badge--current">
                    <CheckCircle className="status-icon" />
                    Session actuelle
                </div>
            );
        }

        if (verified) {
            return (
                <div className="status-badge status-badge--verified">
                    <Shield className="status-icon" />
                    Vérifiée
                </div>
            );
        }

        return (
            <div className="status-badge status-badge--unverified">
                <ShieldAlert className="status-icon" />
                Non vérifiée
            </div>
        );
    };

    return (
        <div className={`device-session-card ${isCurrent ? 'device-session-card--current' : ''} ${verified ? 'device-session-card--verified' : 'device-session-card--unverified'}`}
        >
            {/* ➤ Indicateur si c’est la session actuelle */}
            {isCurrent && <div className="current-indicator" />}

            {/* ➤ En-tête de la carte */}
            <div className="card-header">
                <div className="device-info">
                    <div className={`device-icon-container device-icon-container--${device}`}>
                        {getDeviceIcon()}
                    </div>
                    <div className="device-details">
                        <h3 className="device-name">{browser}</h3>
                        <p className="device-meta">{deviceType} • {os}</p>
                    </div>
                </div>

                {/* ➤ Menu d'actions */}
                <div className="actions-menu">
                    <button className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
                        <MoreVertical className="menu-icon" />
                    </button>

                    {showMenu && (
                        <div className="menu-dropdown">
                            <button className="menu-item" onClick={() => { onViewDetails(session); setShowMenu(false); }}>
                                <Globe className="menu-item-icon" />
                                Voir détails
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ➤ Badge de statut */}
            <div className="status-section">{getStatusBadge()}</div>

            {/* ➤ Détails de la session */}
            <div className="card-details">
                <div className="detail-item">
                    <MapPin className="detail-icon" />
                    <span className="detail-text"> {city}, {country} </span>
                </div>

                <div className="detail-item">
                    <Wifi className="detail-icon" />
                    <span className="detail-text ip-address">
                        {ip === '::1' ? 'localhost' : ip}
                    </span>
                </div>

                <div className="detail-item">
                    <Clock className="detail-icon" />
                    <span className="detail-text">
                        {isCurrent
                            ? 'Maintenant'
                            : `Il y a ${formatDistanceToNow(new Date(lastUsed), { locale: fr })}`
                        }
                    </span>
                </div>

                {/* ➤ Indicateurs sécurité */}
                <div className="security-indicators">
                    <div className="security-item">
                        {isBot ? (
                            <>
                                <AlertTriangle className="security-icon security-icon--danger" />
                                <span className="security-text">Bot détecté</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="security-icon security-icon--success" />
                                <span className="security-text">Humain</span>
                            </>
                        )}
                    </div>

                    {isMobile && (
                        <div className="security-item">
                            <Smartphone className="security-icon security-icon--info" />
                            <span className="security-text">Mobile</span>
                        </div>
                    )}

                    {isTablet && (
                        <div className="security-item">
                            <Tablet className="security-icon security-icon--info" />
                            <span className="security-text">Tablette</span>
                        </div>
                    )}

                    <div className="security-item">
                        <Shield className={`security-icon ${verified ? 'security-icon--success' : 'security-icon--warning'}`} />
                        <span className="security-text">
                            {verified ? 'Session sécurisée' : 'Vérification requise'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DeviceActivity() {
    const { currentUser } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, verified, unverified
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('lastUsed'); // lastUsed, device, browser
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        mobile: 0,
        desktop: 0,
        tablet: 0,
        bots: 0,
    });

    useEffect(() => {
        const fetchSessions = async () => {
            const accessToken = localStorage.getItem('accessToken');
            try {
                setLoading(true);
                const { data } = await sessionService.getDeviceByUserId(currentUser?.id, accessToken);

                // Adapter selon votre structure de réponse
                const sessionsArray = data.data || data || [];
                setSessions(sessionsArray);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.id) {
            fetchSessions();
        }
    }, [currentUser]);

    const fetchSessions = async () => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            setLoading(true);
            const { data } = await sessionService.getDeviceByUserId(currentUser?.id, accessToken);
            const sessionsArray = data.data || data || [];
            setSessions(sessionsArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        const verified = sessions.filter((s) => s.verified)?.length;
        const mobile = sessions.filter((s) => s.isMobile)?.length;
        const desktop = sessions.filter((s) => !s.isMobile && !s.isTablet)?.length;
        const tablet = sessions.filter((s) => s.isTablet)?.length;
        const bots = sessions.filter((s) => s.isBot)?.length;
        setStats({
            total: sessions.length,
            verified,
            mobile,
            desktop,
            tablet,
            bots,
        });
    }, [sessions]);

    // Filtrer les sessions
    const filteredSessions = sessions.filter(session => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'verified' && session.verified) ||
            (filter === 'unverified' && !session.verified) ||
            (filter === 'mobile' && session.isMobile) ||
            (filter === 'tablet' && session.isTablet) ||
            (filter === 'desktop' && !session.isMobile && !session.isTablet) ||
            (filter === 'bots' && session.isBot);

        const matchesSearch =
            searchTerm === '' ||
            session.browser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.os?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.ip?.includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    // Trier les sessions
    const sortedSessions = [...filteredSessions].sort((a, b) => {
        switch (sortBy) {
            case 'lastUsed':
                return new Date(b.lastUsed) - new Date(a.lastUsed);
            case 'createdAt':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'device':
                const getDeviceType = (session) => {
                    if (session.isMobile) return 'mobile';
                    if (session.isTablet) return 'tablet';
                    return 'desktop';
                };
                return getDeviceType(a).localeCompare(getDeviceType(b));
            case 'browser':
                return (a.browser || '').localeCompare(b.browser || '');
            case 'os':
                return (a.os || '').localeCompare(b.os || '');
            default:
                return 0;
        }
    });

    const handleRevokeSession = async (sessionId) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            await sessionService.revokeSession(sessionId, accessToken);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (err) {
            console.error('Erreur révocation:', err);
            throw err;
        }
    };
    const handleViewDetails = (session) => {
        setSelectedSession(session);
        setShowModal(true);
    };

    const handleRevokeAll = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir révoquer toutes les autres sessions ?')) {
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            await sessionService.revokeAllSessions(currentUser?.id, accessToken);

            // Recharger les sessions après révocation
            fetchSessions();
        } catch (err) {
            console.error('Erreur révocation globale:', err);
        }
    };

    const currentDeviceSessionId = localStorage.getItem("deviceSessionId");

    if (loading) return <Loading />

    if (error) {
        return (
            <div className="device-session-list">
                <div className="error-container">
                    <AlertCircle className="error-icon" />
                    <span className="error-text">{error}</span>
                    <button className="retry-button" onClick={fetchSessions}>
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="device-activity">
            <div className="device-session-list">
                {/* Header */}
                <div className="list-header">
                    <div className="header-content">
                        <div className="title-section">
                            <h2 className="main-title">
                                <Shield className="title-icon" />
                                Sessions actives
                            </h2>
                            <p className="subtitle">
                                Gérez vos appareils connectés et sessions de sécurité
                            </p>
                        </div>

                        <div className="header-actions">
                            <button className="refresh-button" onClick={fetchSessions}>
                                <RefreshCw className="button-icon" />
                                Actualiser
                            </button>

                            {sessions.length > 1 && (
                                <button className="revoke-all-button" onClick={handleRevokeAll}>
                                    <Shield className="button-icon" />
                                    Révoquer tout
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="stats-container">
                    <div className="stat-item">
                        <Users className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Sessions totales</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <Shield className="stat-icon stat-icon--verified" />
                        <div className="stat-content">
                            <span className="stat-number">{stats.verified}</span>
                            <span className="stat-label">Vérifiées</span>
                        </div>
                    </div>


                    <div className="stat-item">
                        <Smartphone className="stat-icon stat-icon--mobile" />
                        <div className="stat-content">
                            <span className="stat-number">{stats.mobile}</span>
                            <span className="stat-label">Mobile</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <Monitor className="stat-icon stat-icon--desktop" />
                        <div className="stat-content">
                            <span className="stat-number">{stats.desktop}</span>
                            <span className="stat-label">Desktop</span>
                        </div>
                    </div>

                    {stats.tablet > 0 && (
                        <div className="stat-item">
                            <Tablet className="stat-icon stat-icon--tablet" />
                            <div className="stat-content">
                                <span className="stat-number">{stats.tablet}</span>
                                <span className="stat-label">Tablettes</span>
                            </div>
                        </div>
                    )}


                    {stats.bots > 0 && (
                        <div className="stat-item">
                            <Bot className="stat-icon stat-icon--danger" />
                            <div className="stat-content">
                                <span className="stat-number">{stats.bots}</span>
                                <span className="stat-label">Bots détectés</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filtres et recherche */}
                <div className="filters-container">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher par navigateur, OS ou localisation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-controls">
                        <div className="filter-group">
                            <Filter className="filter-icon" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Toutes les sessions</option>
                                <option value="verified">Vérifiées</option>
                                <option value="unverified">Non vérifiées</option>
                                <option value="mobile">Mobile</option>
                                <option value="tablet">Tablette</option>
                                <option value="desktop">Desktop</option>
                                {stats.bots > 0 && <option value="bots">Bots</option>}
                            </select>
                        </div>

                        <div className="sort-group">
                            <SortDesc className="sort-icon" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select"
                            >
                                <option value="lastUsed">Dernière utilisation</option>
                                <option value="createdAt">Date de création</option>
                                <option value="device">Type d'appareil</option>
                                <option value="browser">Navigateur</option>
                                <option value="os">Système d'exploitation</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Liste des sessions */}
                <div className="sessions-grid">
                    {sortedSessions.length === 0 ? (
                        <div className="empty-state">
                            <Shield className="empty-icon" />
                            <h3 className="empty-title">Aucune session trouvée</h3>
                            <p className="empty-description">
                                {searchTerm || filter !== 'all'
                                    ? 'Aucune session ne correspond à vos critères de recherche.'
                                    : "Vous n'avez aucune session active."
                                }
                            </p>
                        </div>
                    ) : (
                        sortedSessions.map((session) => (
                            <DeviceSessionCard
                                key={session.id}
                                session={session}
                                isCurrent={session.id === currentDeviceSessionId} // À adapter selon ton contexte
                                onRevoke={handleRevokeSession}
                                onViewDetails={handleViewDetails}
                            />
                        ))
                    )}
                </div>

                {/* Modal de détails (si nécessaire) */}
                {showModal && selectedSession && (
                    <DeviceSessionModal
                        session={selectedSession}
                        onClose={() => {
                            setShowModal(false);
                            setSelectedSession(null);
                        }}
                        onRevoke={handleRevokeSession}
                    />
                )}
            </div>
        </div>
    );
};
