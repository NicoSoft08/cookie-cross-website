import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import '../../../styles/headers/AuthHeader.scss';

export const AuthHeader = () => {
    const { currentUser } = useAuth();
    const location = window.location;
    console.log(location);
    const isLogin = location.pathname === '/auth/signin';
    const isSignup = location.pathname === '/auth/signup';
    const isSignupConfirm = location.pathname === '/auth/signup/verify-email';
    const isPasswordReset = location.pathname === '/auth/reset-password';
    const isSignupSuccess = location.pathname === '/auth/signup/success';

    const redirectUrl =
        (location.state && location.state.redirectUrl) ||
        new URLSearchParams(location.search).get('redirect');

    // Check if the user is authenticated
    // Redirect to redirectUrl if authenticated
    useEffect(() => {
        if (currentUser && redirectUrl) {
            window.location.href = redirectUrl;
            return;
        }
    }, [currentUser, redirectUrl]);

    let leftLink = '/';
    let leftText = "Accueil";

    if (isSignup || isSignupConfirm || isPasswordReset || isSignupSuccess) {
        leftLink = '/signin';
        leftText = 'Connexion';
    }

    return (
        <div className="auth-header">
            <Link to={leftLink} className="link">
                <ChevronLeft size={24} />
                <span> {leftText} </span>
            </Link>

            {isLogin && (
                <Link to={'/signup'} className="link">
                    <span> Inscription </span>
                </Link>
            )}
        </div>
    );
};
