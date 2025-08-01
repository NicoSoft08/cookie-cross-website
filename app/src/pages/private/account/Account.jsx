import { ActivitySquare, CreditCard, HelpCircle, Home, LayoutDashboard, LockKeyhole, LucideMessageCircle, MailCheck, MonitorSmartphone, Settings, Shield, ShieldAlert, Store, User } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { useAuth } from "../../../contexts/AuthContext";
import { CardItem } from "../../../components/ui/Card";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import '../../../styles/account/Account.scss';

export const navItems = (userRole) => {
    const baseItems = [
        {
            path: '/account/quick-access',
            icon: <Home size={20} />,
            label: 'Accueil',
            description: 'Gérez vos informations, ainsi que la confidentialité et la sécurité de vos données pour profiter au mieux des services AdsCity'
        },
        {
            path: '/account/profile',
            icon: <User className='text-blue' size={20} />,
            label: 'Profile',
            description: 'Infos sur vous et vos préférences dans les services AdsCity'
        },
         {
            path: '/account/messenger',
            icon: <LucideMessageCircle className='text-gray' size={20} />,
            label: 'Messenger',
            description: "Espace d'échanges avec votre clientèle et le Service Client Adscity",
        },
        {
            path: '/account/security',
            icon: <Shield className='text-emerald' size={20} />,
            label: 'Sécurité',
            description: 'Paramètres et recommandations pour vous aider à protéger votre compte'
        },
        {
            path: '/account/settings',
            icon: <Settings className='text-gray' size={20} />,
            label: 'Paramètres',
            description: 'Personnalisez votre expérience sur AdsCity'
        },
        {
            path: '/account/payments-and-subscriptions',
            icon: <CreditCard className='text-purple' size={20} />,
            label: 'Paiements et abonnements',
            description: 'Vos informations de paiement, vos transactions, vos paiements récurrents et vos réservations'
        },
        {
            path: '/security-center',
            icon: <ShieldAlert className='text-amber' size={20} />,
            label: 'Centre de Sécurité',
            description: 'Surveillez les activités suspectes et protégez votre compte'
        },
        {
            path: '/account/help',
            icon: <HelpCircle className='text-red' size={20} />,
            label: 'Aide',
            description: 'Obtenez de l\'aide et suivez vos demandes de support'
        }
    ];

    // Ajouter la boutique selon le rôle
    if (userRole === 'ADMIN') {
        baseItems.splice(6, 0, {
            path: '/admin/quick-access',
            icon: <LayoutDashboard className='text-blue' size={20} />,
            label: 'Tableau de bord',
            description: 'Accédez à l\'interface d\'administration pour gérer les utilisateurs, les produits et les transactions.'
        });
    } else if (userRole === 'USER') {
        baseItems.splice(6, 0, {
            path: '/dashboard/quick-access',
            icon: <Store className='text-blue' size={20} />,
            label: 'Boutique',
            description: 'Gérez votre boutique et vos produits sur AdsCity'
        });
    }

    return baseItems;
};

const UserGreeting = ({ name }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) return 'Bonjour';
        if (hour >= 12 && hour < 17) return 'Bon après-midi';
        if (hour >= 17 && hour < 21) return 'Bonsoir';
        return 'Bonne nuit';
    };
    return (
        <div className="user-greeting">
            <Avatar name={name} size="xl" />

            <h1 className="greeting">
                {getGreeting()}, {name} 👋
            </h1>
            <p>Gérez vos informations, ainsi que la confidentialité et la sécurité de vos données pour profiter au mieux des services AdsCity.</p>
        </div>
    )
}


export default function Account() {
    const privacy_secure = require('../../../imgs/privacy-secure.png');
    const { currentUser } = useAuth();
    const name = `${currentUser?.firstName} ${currentUser?.lastName}`;



    useEffect(() => {
        document.title = 'AdsCity - Mon compte';
    }, []);

    useEffect(() => {
        if (!currentUser) {
            window.location.href = '/auth/signin?continue=/account';
        }
    }, [currentUser]);

    const tabs = [
        { key: 'password', label: 'Mon mot de passe', icon: <LockKeyhole size={18} />, link: `${window.location.origin}/auth/signin/challenge/pwd&continue=${window.location.origin}/account/profile/password` },
        { key: 'devices', label: 'Appareils', icon: <MonitorSmartphone size={18} />, link: '/account/profile/device-activity' },
        { key: 'activity', label: 'Mon activité', icon: <ActivitySquare size={18} />, link: '/account/profile/my-activity' },
        { key: 'emails', label: 'Adresses e-mail', icon: <MailCheck size={18} />, link: '/account/security/email-addresses' },
    ];

    return (
        <div className="account">
            <UserGreeting name={name} />

            <div className="account-tabs">
                <div className="tabs-header">
                    {tabs.map((tab) => (
                        <button key={tab.key} className="tab-button">
                            <a href={tab.link} className="tab-link">
                                <span className="tab-icon">{tab.icon}</span>
                                {tab.label}
                            </a>
                        </button>
                    ))}
                </div>
            </div>

            <div className="quick-access-container">
                {/* QUICK ACCESS */}
                <CardItem title="Accès Rapide" className="mb-6">
                    <div className="quick-access-items">

                        {navItems(currentUser?.role).map((item, index) => {
                            if (item.label === 'Accueil' || item.label === 'Tableau de bord') return null;
                            return (
                                <QuickAccessItem
                                    key={index}
                                    to={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    description={item.description}
                                />
                            );
                        })}
                    </div>
                </CardItem>
            </div>

            <div className="account-footer">
                <p>
                    Vous seul pouvez voir votre activité. AdsCity protège la confidentialité et la sécurité de vos données.
                </p>
                <img src={privacy_secure} alt={privacy_secure} />
            </div>
        </div>
    )
};

const QuickAccessItem = ({ to, icon, label, description, badge }) => {
    return (
        <Link to={to} className="quick-access-item">
            <div className="quick-access-icon-wrapper">
                <div className="quick-access-icon">
                    {icon}
                </div>
                {badge && (
                    <span className="quick-access-badge">
                        {badge}
                    </span>
                )}
            </div>
            <div className="quick-access-details">
                <span className="quick-access-label">{label}</span>
                <span className='quick-access-description'>
                    {description}
                </span>
            </div>
        </Link>
    );
};
