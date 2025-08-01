import Logo from '../../components/ui/Logo';
import { logos } from '../../config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Spinner from '../../components/ui/Spinner';
import { Lock, Mail } from 'lucide-react';
import useLogin from "../../hooks/useLogin";
import Toast from '../../components/ui/Toast';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth/Signin.scss';
import SecureInput from '../../components/SecureInput';

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

export default function Signin() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Récupérer la destination de redirection
    const from = location.state?.from?.pathname;
    const redirectParam = new URLSearchParams(location.search).get('continue');
    const redirectTo = redirectParam || from;

    const {
        formData,
        toast,
        setToast,
        errors,
        isLoading,
        emailCheckLoading,
        showPassword,
        handleChange,
        handleSubmit,
        toggleShowPassword,
        handleCaptchaChange,
    } = useLogin();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (currentUser) {
            navigate(redirectTo, { replace: true });
        }
    }, [currentUser, navigate, redirectTo]);

    return (
        <div className="signin">
            {/* Header avec Logo */}
            <div className='container'>
                <div className='header'>
                    <Logo src={logos.letterWhiteBgBlue} size='lg' alt='AdsCity' onclick={() => navigate('/')} />
                    <h1 className="title">
                        Bon retour !
                    </h1>
                    <p className="subtitle">
                        Connectez-vous à votre compte
                    </p>
                </div>
                {/* Form */}
                <div className="form">

                    {errors.serve && <p className="error-message">{errors.serve}</p>}

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Adresse e-mail
                        </label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <SecureInput
                                className={`form-input ${errors.email ? 'error' : ''} ${formData.email ? 'filled' : ''}`}
                                type="email"
                                name="email"
                                id="email"
                                placeholder='votre@email.com'
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            {emailCheckLoading && (
                                <div className="input-loading">
                                    <Spinner variant="bounce" size={10} color="#6c757d" />
                                </div>
                            )}
                        </div>
                        {errors.email && (
                            <div id="email-error" className="error-message" role="alert">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mot de passe
                        </label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />

                            <SecureInput
                                className={`form-input ${errors.password ? 'error' : ''} ${formData.password ? 'filled' : ''}`}
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Votre mot de passe"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                showPasswordToggle={true}
                                onTogglePassword={toggleShowPassword}
                                showPassword={showPassword}
                                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                        </div>
                        {errors.password && (
                            <div id="password-error" className="error-message" role="alert">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Options supplémentaires */}
                    <div className="form-options">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">
                                Se souvenir de moi
                            </span>
                        </label>

                        <Link to="/auth/forgot-password" className="forgot-pass">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    {/* Conditions d'utilisation */}
                    <div className="form-group">
                        <label className="checkbox-wrapper checkbox-wrapper--terms">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                                className="checkbox-input"
                                aria-describedby={errors.agree ? 'agree-error' : undefined}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">
                                J'accepte les{' '}
                                <Link to={`/legal/terms`} target="_blank" className="terms-link">
                                    Conditions d'utilisation{' '}
                                </Link>
                                et la{' '}
                                <Link to={`/legal/privacy-policy`} target="_blank" className="terms-link">
                                    Politique de confidentialité
                                </Link>
                            </span>
                        </label>
                        {errors.agree && (
                            <div id="agree-error" className="error-message" role="alert">
                                {errors.agree}
                            </div>
                        )}
                    </div>

                    {/* reCAPTCHA */}
                    <div className="form-group">
                        <div className="captcha-wrapper">
                            <ReCAPTCHA
                                sitekey={RECAPTCHA_SITE_KEY}
                                onChange={handleCaptchaChange}
                                theme="light"
                                size="normal"
                            />
                        </div>
                        {errors.captcha && (
                            <div className="error-message" role="alert">
                                {errors.captcha}
                            </div>
                        )}
                    </div>

                    {/* Bouton de connexion */}
                    <button
                        type="submit"
                        className="nav-button nav-button--submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? (
                            <>
                                <Spinner variant="bounce" size={15} color="#fff" />
                            </>
                        ) : (
                            <span>
                                Se connecter
                            </span>
                        )}
                    </button>

                    {/* Lien d'inscription */}
                    <div className="signup-link">
                        <p>
                            Pas encore de compte ?
                            {' '}
                            <Link to="/auth/signup" className="link">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ show: false, type: '', message: '' })}
                />
            )}
        </div>
    );
};
