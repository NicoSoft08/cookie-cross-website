import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoryService } from "../../../services/categories";
import Logo from "../../../components/ui/Logo";
import { logos } from "../../../config";
import SearchBar from "../../../components/ui/SearchBar";
import Avatar from "../../../components/ui/Avatar";
import { Plus } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useStore } from "../../../contexts/StoreContext";
import { getCreatePostRedirectPath } from "../../../utils/redirects/createPostRedirect";
import '../../../styles/headers/HomeHeader.scss';

const authURL = process.env.REACT_APP_AUTH_URL;
const accountURL = process.env.REACT_APP_ACCOUNT_URL;

const TopHeader = ({ currentUser }) => {
    if (currentUser) return null; // If user is logged in, do not show the top header

    return (
        <div className="top-header">
            <div className="__left">
                <Link to={'/help'}><span>Aide</span></Link>
            </div>
            <div className="__right">
                <Link to={`${authURL}`}><span>Connexion</span></Link>
                <Link to={`${authURL}/signup`}><span>Inscription</span></Link>
            </div>
        </div>
    );
};

const MiddleHeader = ({ currentUser, store }) => {
    const navigate = useNavigate();

    const name = `${currentUser?.firstName} ${currentUser?.lastName}`;

    const handleCreatePost = () => {
        const path = getCreatePostRedirectPath(currentUser, store);
        window.location.href = path
    };

    const handleNavigate = async () => {
        if (!currentUser) {
            window.location.href = `${authURL}?continue=${accountURL}`;
            return;
        }

        if (!currentUser?.emailVerified) {
            window.location.href = `${authURL}/verify-email?continue=${accountURL}`;
            return;
        }

       window.location.href = `${accountURL}`;
    }
    return (
        <div className="middle-header">
            <div className="__left">
                <Logo src={logos.letterBlueBgWhite} alt="Logo" size="md" onclick={() => navigate('/')} />
            </div>
            <div className="__middle">
                <SearchBar currentUser={currentUser} />
            </div>
            <div className="__right">
                <Avatar
                    name={name}
                    size="md"
                    onclick={handleNavigate}
                />

                <button
                    className='create-post-btn'
                    onClick={handleCreatePost}
                >
                    <Plus size={20} className='icon' />
                    <span>Créer une annonce</span>
                </button>
            </div>
        </div>
    )
};

const BottomHeader = () => {
    const [cats, setCats] = useState([]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const lang = 'fr';
            const { data } = await categoryService.getCategories(lang);
            setCats(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };


    return (
        <div className="bottom-header">
            {cats.map((cat, index) => (
                <div key={index} id={cat.id} className="bottom-header-item">
                    <Link to={`/category/${cat.slug}`}>
                        <img
                            src={cat.image}
                            alt={cat.slug}
                            crossOrigin="anonymous"
                        />
                        <span>{cat.name}</span>
                    </Link>
                </div>
            ))}
        </div>
    )
};

export const AppHeader = () => {
    const { currentUser } = useAuth();
    const { store } = useStore();
    return (
        <div className="app-header">
            <div className="content">
                <TopHeader currentUser={currentUser} />
                <MiddleHeader currentUser={currentUser} store={store} />
                <BottomHeader />
            </div>
        </div >
    );
};