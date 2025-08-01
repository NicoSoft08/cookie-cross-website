import { Bell, CirclePlay, CreditCard, Folder, Heart, HelpCircle, Home, LayoutDashboard, LucideMessageCircle, Settings, Shield, ShieldAlert, ShieldCheck, Store, User, Users } from 'lucide-react';

export const IconAvatar = require('../imgs/user-avatar.png');;

export const logos = {
    textBlueWithoutBg: require('../assets/icons/blue-no-bg.png'),
    letterWhiteBgBlue: require('../assets/icons/logo-letter-bg.png'),
    letterBlueBgWhite: require('../assets/icons/logo-letter-light.png'),
    textWhiteBgBlue: require('../assets/icons/logo-text-bg.png'),
    textBlueBgWhite: require('../assets/icons/logo-text-light.png'),
    textWhiteWithoutBg: require('../assets/icons/white-no-bg.png'),
};

export const navItems = (userRole) => {
    const items = [
        {
            path: '/account',
            icon: <Home size={20} />,
            label: 'Accueil',
            description: 'Gérez vos informations, ainsi que la confidentialité et la sécurité de vos données pour profiter au mieux des services AdsCity',
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: '/account/profile',
            icon: <User className='text-blue' size={20} />,
            label: 'Profil',
            description: 'Infos sur vous et vos préférences dans les services AdsCity',
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: '/account/messenger',
            icon: <LucideMessageCircle className='text-blue' size={20} />,
            label: 'Messenger',
            description: "Espace d'échanges avec votre clientèle et le Service Client Adscity",
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: '/account/security',
            icon: <Shield className='text-emerald' size={20} />,
            label: 'Sécurité',
            description: 'Paramètres et recommandations pour vous aider à protéger votre compte',
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: '/account/settings',
            icon: <Settings className='text-gray' size={20} />,
            label: 'Paramètres',
            description: 'Personnalisez votre expérience sur AdsCity',
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: '/account/payments-and-subscriptions',
            icon: <CreditCard className='text-purple' size={20} />,
            label: 'Paiements et abonnements',
            description: 'Vos informations de paiement, vos transactions, vos paiements récurrents et vos réservations',
            requiredRoles: ['USER', 'ADMIN']
        },
        {
            path: '/account/security-center',
            icon: <ShieldAlert className='text-amber' size={20} />,
            label: 'Centre de Sécurité',
            description: 'Surveillez les activités suspectes et protégez votre compte',
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: `${window.location.origin}/dashboard`,
            icon: <LayoutDashboard className='text-blue' size={20} />,
            label: 'Tableau de bord',
            description: 'Gérez votre boutique et vos produits sur AdsCity',
            requiredRoles: ['USER']
        },
        {
            path: `${window.location.origin}/admin`,
            icon: <LayoutDashboard className='text-blue' size={20} />,
            label: 'Tableau de bord',
            description: 'Interface d\'administration pour gérer les utilisateurs, produits et transactions',
            requiredRoles: ['ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
        {
            path: '/account/help',
            icon: <HelpCircle className='text-red' size={20} />,
            label: 'Aide',
            description: 'Obtenez de l\'aide et suivez vos demandes de support',
            requiredRoles: ['USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']
        },
    ];

    // Filtrage selon le rôle
    return items.filter(item => item.requiredRoles.includes(userRole));
};


export const adminSidebarData = [
    {
        id: 'quick-access',
        label: 'Accueil',
        icon: <Home size={20} />,
        path: "/admin"
    },
    {
        id: 'posts',
        label: "Annonces",
        icon: <Folder size={20} />,
        path: "/admin/posts"
    },
    {
        id: 'users',
        label: 'Utilisateurs',
        icon: <Users size={20} />,
        path: "/admin/users"
    },
    {
        id: 'stores',
        label: 'Magasins',
        icon: <Store size={20} />,
        path: "/admin/stores"
    },
    // { id: "pubs", name: language === 'FR' ? 'Publicités' : 'Advertisements', icon: faBuysellads, path: "/pubs" },
    {
        id: "verifications",
        label: 'Vérifications',
        icon: <ShieldCheck size={20} />,
        path: "/admin/verifications",
        badge: 0
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell size={20} />,
        path: "/admin/notifications",
        badge: 0
    },
    // { id: 'payments', name: language === 'FR' ? 'Paiements' : 'Payments', icon: faMoneyBill, path: "/payments" },
    {
        id: 'profile',
        label: 'Profile',
        icon: <User size={20} />,
        path: `${window.location.origin}/account`
    },
];

export const userSidebarData = [
    {
        id: 'panel',
        label: 'Accueil',
        icon: <Home size={20} />,
        path: '/dashboard/quick-access'
    },
    {
        id: 'posts',
        label: 'Annonces',
        icon: <Folder size={20} />,
        path: '/dashboard/posts'
    },
    {
        id: 'favoris',
        label: 'Favoris',
        icon: <Heart size={20} />,
        path: "/dashboard/favoris"
    },
    {
        id: 'status',
        label: 'Statuts',
        icon: <CirclePlay size={20} />,
        path: "/dashboard/status"
    },
    {
        id: 'verifications',
        label: 'Vérifications',
        icon: <ShieldCheck size={20} />,
        path: "/dashboard/verifications",
        badge: 0
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell size={20} />,
        path: "/dashboard/notifications",
        badge: 0
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: <User size={20} />,
        path: `${window.location.origin}/account`
    },
];

export const resetPasswordFormValidationRules = {
    email: {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        maxLength: 254,
        messages: {
            required: 'L\'adresse email est requise',
            pattern: 'Veuillez saisir une adresse email valide',
            maxLength: 'L\'adresse email est trop longue',
            exists: 'Cette adresse email est déjà utilisée'
        }
    },
};

export const registerFormValidationRules = {
    firstName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        messages: {
            required: 'Le prénom est requis',
            minLength: 'Le prénom doit contenir au moins 2 caractères',
            maxLength: 'Le prénom ne doit pas dépasser 50 caractères'
        }
    },
    lastName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        messages: {
            required: 'Le nom est requis',
            minLength: 'Le nom doit contenir au moins 2 caractères',
            maxLength: 'Le nom ne doit pas dépasser 50 caractères'
        }
    },
    email: {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        maxLength: 254,
        messages: {
            required: 'L\'adresse email est requise',
            pattern: 'Veuillez saisir une adresse email valide',
            maxLength: 'L\'adresse email est trop longue',
            exists: 'Cette adresse email est déjà utilisée'
        }
    },
    phoneNumber: {
        required: true,
        pattern: /^[0-9]{10}$/,
        messages: {
            required: 'Le numéro de téléphone est requis',
            pattern: 'Le numéro de téléphone doit contenir 10 chiffres'
        }
    },
     password: {
        required: true,
        minLength: 8,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        messages: {
            required: 'Le mot de passe est requis',
            minLength: 'Le mot de passe doit contenir au moins 8 caractères',
            maxLength: 'Le mot de passe est trop long',
            pattern: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
        }
    },
    confirmPassword: {
        required: true,
        messages: {
            required: 'La confirmation du mot de passe est requise',
            match: 'Les mots de passe ne correspondent pas'
        }
    }
}

// Règles de validation (déplacées en dehors du composant pour éviter les re-créations)
export const emailValidationRules = {
    email: {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        maxLength: 254,
        messages: {
            required: 'L\'adresse email est requise',
            pattern: 'Veuillez saisir une adresse email valide',
            maxLength: 'L\'adresse email est trop longue',
            exists: 'Cette adresse email est déjà utilisée'
        }
    },
    password: {
        required: true,
        minLength: 8,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        messages: {
            required: 'Le mot de passe est requis',
            minLength: 'Le mot de passe doit contenir au moins 8 caractères',
            maxLength: 'Le mot de passe est trop long',
            pattern: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
        }
    },
    confirmPassword: {
        required: true,
        messages: {
            required: 'La confirmation du mot de passe est requise',
            match: 'Les mots de passe ne correspondent pas'
        }
    }
};

export const validationRules = {
    email: {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        maxLength: 254,
        messages: {
            required: 'L\'adresse email est requise',
            pattern: 'Veuillez saisir une adresse email valide',
            maxLength: 'L\'adresse email est trop longue',
            exists: 'Cette adresse email est déjà utilisée'
        }
    },
    password: {
        required: true,
        minLength: 8,
        maxLength: 128,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        messages: {
            required: 'Le mot de passe est requis',
            minLength: 'Le mot de passe doit contenir au moins 8 caractères',
            maxLength: 'Le mot de passe est trop long',
            pattern: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
        }
    },
};

// Configuration des étapes
export const stepFields = {
    0: ['firstName', 'lastName'],
    1: ['email', 'phoneNumber'],
    2: ['password', 'confirmPassword']
};

export const sber_bank = require('../assets/banks/sber-bank.png');
export const tinkoff_bank = require('../assets/banks/tinkoff-bank.png');
export const vtb_bank = require('../assets/banks/vtb-bank.png');
export const alpha_bank = require('../assets/banks/alfa-bank.png');

export const orange_money = require('../assets/mo-mo/orange-money.png');
export const mtn_money = require('../assets/mo-mo/mtn-money.png');
export const moov_money = require('../assets/mo-mo/moov-money.png');

export const wave = require('../assets/wallet/wave.png');
export const flashsend = require('../assets/wallet/flashsend.png');
