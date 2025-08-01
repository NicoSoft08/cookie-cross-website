import { AlertCircle, ChevronLeft, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "../../../components/ui/Spinner";
import { authService } from "../../../services/auth";
import Toast from "../../../components/ui/Toast";
import '../../../styles/account/AddEmailAddress.scss';

export default function AddEmailAddress() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type') || 'secondary';
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [code, setCode] = useState('');
    const [correctCode] = useState('');
    const [codeOptions, setCodeOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'blocked'
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // États pour le renvoi
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    // États pour les tentatives
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);

    // Constantes
    const maxAttempts = 5;
    const blockDuration = 300; // 5 minutes en secondes

    // Gestion du countdown pour le renvoi
    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    // Gestion du blocage temporaire
    useEffect(() => {
        if (attempts >= maxAttempts && !isBlocked) {
            setIsBlocked(true);
            setToast({
                show: true,
                type: 'error',
                message: `Trop de tentatives. Réessayez dans ${Math.floor(blockDuration / 60)} minutes.`
            });

            // Débloquer après la durée définie
            const unblockTimer = setTimeout(() => {
                setIsBlocked(false);
                setAttempts(0);
                setToast({
                    show: true,
                    type: 'info',
                    message: 'Vous pouvez maintenant réessayer.'
                });
            }, blockDuration * 1000);

            return () => clearTimeout(unblockTimer);
        }
    }, [attempts, isBlocked]);

    const getLabel = () => {
        if (type === 'recovery-email') return "Adresse e-mail de récupération";
        return "Adresse e-mail secondaire";
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleResend = async () => {
        if (!canResend || resendLoading) return;

        setResendLoading(true);

        try {
            const response = await authService.sendEmailVerification(email);

            if (response.success) {
                showToast('success', 'Nouveau code envoyé !');
                setCountdown(60);
                setCanResend(false);
                setCode('');
                setAttempts(0);
                setStatus('pending');
            } else {
                showToast('error', response.message || 'Échec de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur renvoi:', error);
            showToast('error', 'Erreur de connexion. Réessayez plus tard.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.includes('@')) {
            setError("Adresse e-mail invalide");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authService.sendOtpChallenge(
                email,
                localStorage.getItem('accessToken')
            );

            if (res.success) {
                setCodeOptions(res.codes);
                setStatus('verifying'); // Affiche les choix de codes
                setCountdown(60);
                setCanResend(false);
                setAttempts(0);
                showToast('success', 'Code envoyé avec succès');
            } else {
                showToast('error', res.message || 'Échec de l’envoi du code');
            }
        } catch (err) {
            showToast('error', 'Erreur serveur. Réessayez plus tard.');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSelection = async (selectedCode) => {
        setCode(selectedCode);

        if (selectedCode) {
            if (type === 'recovery') {
                const res = await authService.addRecoveryEmail(
                    localStorage.getItem('accessToken'),
                    email,
                    type
                );

                if (res.success) {
                    showToast('success', 'Adresse de récupération ajoutée avec succès');
                }
            }

            showToast('success', 'Adresse e-mail vérifiée avec succès');
            setStatus('success');
            setTimeout(() => navigate('/account/security/email-addresses'), 1500);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= maxAttempts) {
                showToast('error', 'Trop de tentatives, réessayez plus tard.');
                setStatus('blocked');
            } else {
                showToast('error', 'Code incorrect. Veuillez réessayer.');
            }
        }
    };

    const changeEmail = () => {
        setStatus('idle');
        setCode('');
        setEmail('');
        setError('');
    };

    return (
        <div className="add-email-address">
            <div className="page-header">
                <div className="back" onClick={() => window.location.href = '/account/security'}>
                    <ChevronLeft size={24} />
                </div>
                <h2>Ajout d'{getLabel().toLowerCase()}</h2>
            </div>

            <p className="description">Cette adresse sera utilisée pour renforcer la sécurité de votre compte.</p>

            <div className='container'>
                {status === 'blocked' ? (
                    <div className="blocked-section">
                        <div className="blocked-header">
                            <AlertCircle size={48} className="blocked-icon" />
                            <h2>Trop de tentatives</h2>
                            <p>Vous avez effectué trop de tentatives incorrectes.</p>
                        </div>

                        <div className="blocked-info">
                            <div className="blocked-timer">
                                <span className="timer-icon">⏳</span>
                                <span>Réessayez dans {Math.floor(blockDuration / 60)} minutes</span>
                            </div>

                            <div className="blocked-suggestions">
                                <h3>En attendant, vous pouvez :</h3>
                                <ul>
                                    <li>Vérifier votre dossier spam</li>
                                    <li>Vous assurer que l'email {email} est correct</li>
                                    <li>Contacter notre support si le problème persiste</li>
                                </ul>
                            </div>
                        </div>

                        <div className="blocked-actions">
                            <div className="change-email">
                                <button className="link-button" onClick={() => setStatus('idle')}>Modifier l'adresse email</button>
                            </div>
                            <button
                                className="blocked-action-btn"
                                onClick={() => window.open('mailto:support@adscity.net', '_blank')}
                            >
                                <Mail size={16} />
                                Contacter le support
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {status !== 'verifying' ? (
                            <div className="form">
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Adresse e-mail
                                    </label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" />
                                        <input
                                            className={`form-input ${error ? 'error' : ''} ${email ? 'filled' : ''}`}
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder='votre@email.com'
                                            value={email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            aria-describedby={error ? 'email-error' : undefined}
                                        />
                                    </div>
                                    {error && (
                                        <div id="email-error" className="error-message" role="alert">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Bouton de connexion */}
                                <button
                                    type="submit"
                                    className="nav-button nav-button--submit"
                                    disabled={loading}
                                    onClick={handleSubmit}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner variant="bounce" size={15} color="#fff" />
                                        </>
                                    ) : (
                                        <span>
                                            Ajouter
                                        </span>
                                    )}
                                </button>
                            </div>

                        ) : (
                            <div className="verification-steps">
                                {['Ouvrez votre boîte mail', 'Retenez le code reçu', 'Sélectionnez-le ici et vérifiez'].map((txt, i) => (
                                    <div className="step" key={i}>
                                        <span className="step-number">{i + 1}</span>
                                        <span className="step-text">{txt}</span>
                                    </div>
                                ))}

                                <div className="codes">
                                    {codeOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleCodeSelection(opt)}
                                            className={`code-option ${code === opt ? 'selected' : ''}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                <div className="">
                                    {attempts > 0 ? `Tentatives restantes : ${maxAttempts - attempts}` : null}

                                </div>

                                <div className="form-options">
                                    <div className="change-email" onClick={changeEmail}>
                                        Changer d'adresse e-mail
                                    </div>
                                    <button
                                        onClick={handleResend}
                                        className="resend-code"
                                    >
                                        Renvoyer le code
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {status === 'success' && (
                    <div className="mt-6 text-green-600 flex items-center gap-2">
                        <ShieldCheck /> Vérification réussie ! Redirection en cours...
                    </div>
                )}

                {error && <div className="text-red-600 mt-4">{error}</div>}
            </div>

            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};
