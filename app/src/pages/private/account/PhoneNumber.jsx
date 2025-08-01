import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ChevronLeft, Lock, Mail, Phone } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import '../../../styles/account/PersoInfo.scss';
import PinField from "react-pin-field";
import { Card, CardContent, CardDescription } from "../../../components/ui/Card";
import ReCAPTCHA from "react-google-recaptcha";
import { authService } from "../../../services/auth";
import { Spinner } from "react-activity";
import Toast from "../../../components/ui/Toast";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

export default function PhoneNumber() {
    const [searchParams] = useSearchParams();
    const [newPhone, setNewPhone] = useState('');
    const [captchaValue, setCaptchaValue] = useState(null);

    // États principaux
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('pending'); // pending | checking | verified | error
    const [code, setCode] = useState('');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // États pour le renvoi
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    // États pour les tentatives
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const actionParam = searchParams.get('action');
    const navigate = useNavigate();

    // Refs
    const pinRef = useRef(null);
    const recaptchaRef = useRef(null);

    // Constantes
    const maxAttempts = 5;
    const codeLength = 6;
    const blockDuration = 300; // 5 minutes en secondes

    console.log(actionParam);

    // Gestion du countdown pour le renvoi
    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    // Auto-focus sur le premier champ PIN - CORRECTION ICI
    useEffect(() => {
        if (!isLoading && status === 'pending') {
            // Utiliser un délai pour s'assurer que le composant est monté
            const timer = setTimeout(() => {
                // Chercher le premier input du PinField
                const firstInput = document.querySelector('.pin-field input:first-child');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isLoading, status]);

    // Focus après erreur - CORRECTION ICI
    const focusFirstInput = () => {
        setTimeout(() => {
            const firstInput = document.querySelector('.pin-field input:first-child');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    };

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

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const formatHeader = () => {
        switch (actionParam) {
            case 'edit-phone':
                return 'Modification du numéro de téléphone'
            default:
                return null
        }
    };

    const handleVerificationError = (message) => {
        setStatus('error');
        setAttempts(prev => prev + 1);
        setCode('');
        showToast('error', message);

        setTimeout(() => {
            if (attempts + 1 < maxAttempts) {
                setStatus('pending');
                focusFirstInput(); // Utiliser la nouvelle fonction
            }
        }, 1500);
    };

    // Gestion du captcha
    const handleCaptchaChange = useCallback((value) => {
        setCaptchaValue(value);
        if (value && errors.captcha) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.captcha;
                return newErrors;
            });
        }
    }, [errors.captcha]);

    const handlePhoneChange = (value) => {
        setNewPhone(value)
    }

    const handleCodeChange = (value) => {
        setCode(value);


        if (status === 'error') {
            setStatus('pending');
        }
    };

    const handleResend = async () => {
        if (!canResend || resendLoading) return;

        setResendLoading(true);

        try {
            const response = await authService.sendPhoneCode(
                newPhone,
                localStorage.getItem('accessToken')
            );

            if (response.success) {
                showToast('success', 'Nouveau code envoyé !');
                setCountdown(60);
                setCanResend(false);
                setCode('');
                setAttempts(0);
                setStatus('pending');
                focusFirstInput(); // Focus après renvoi
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

    const handleVerifyCode = async () => {
        if (code.length !== codeLength || status === 'checking' || isBlocked) return;

        setStatus('checking');

        try {
            const data = await authService.sendPhoneCode(
                newPhone,
                captchaValue,
                localStorage.getItem('accessToken')
            );

            if (data.success) {
                setStatus('verified');
                showToast('success', 'Numéro de téléphone vérifié avec succès !');

                setTimeout(() => {
                    navigate('/account/profile/personal-info');
                }, 2000);
            } else {
                handleVerificationError(data.message || 'Code invalide');
            }
        } catch (e) {
            console.error('Erreur vérification:', e);
            handleVerificationError('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="phone-number">
            <div className="page-header">
                <div className="back" onClick={() => navigate('/account/profile')}>
                    <ChevronLeft size={24} />
                </div>
                <h2>{formatHeader(actionParam)}</h2>
            </div>

            {actionParam === 'edit-phone' && (
                <div className="info-card">
                    <div className="form">
                        {!code ? (
                            <>
                                <div className="pin-code-field">
                                    <PinField
                                        ref={pinRef}
                                        length={codeLength}
                                        validate={/^[0-9]$/}
                                        value={code}
                                        onChange={handleCodeChange}
                                        className="pin-field"
                                    />
                                </div>

                                <div className="verification-buttons">
                                    <button
                                        className="verify-button primary"
                                        onClick={handleVerifyCode}
                                        disabled={status === 'checking' || code.length !== codeLength}
                                    >
                                        {status === 'checking'
                                            ? <Spinner variant="bounce" size={15} color="#fff" />
                                            : <> <CheckCircle size={18} /> Vérifier</>}
                                    </button>

                                    <button
                                        className="resend-button secondary"
                                        onClick={handleResend}
                                        disabled={!canResend}
                                    >
                                        {canResend
                                            ? <> <Lock size={18} /> Renvoyer le code </>
                                            : <> <Spinner variant="bounce" size={15} color="#fff" /> Renvoyer dans {countdown}s</>}
                                    </button>
                                </div>

                                <div className="verification-help open">
                                    <details className="help-details">
                                        <summary>Vous ne recevez pas le code ?</summary>
                                        <div className="help-content">
                                            <div className="help-grid">
                                                <div className="help-item">
                                                    <span className="help-icon">📁</span>
                                                    <div>
                                                        <strong>Vérifiez vos spams</strong>
                                                        <p>Le code peut être dans votre dossier indésirable</p>
                                                    </div>
                                                </div>
                                                <div className="help-item">
                                                    <span className="help-icon">✉️</span>
                                                    <div>
                                                        <strong>Numéro de téléphone correct ?</strong>
                                                        <p>Assurez-vous que {newPhone} est correct</p>
                                                    </div>
                                                </div>
                                                <div className="help-item">
                                                    <span className="help-icon">⏰</span>
                                                    <div>
                                                        <strong>Patientez un peu</strong>
                                                        <p>La livraison peut prendre jusqu'à 5 minutes</p>
                                                    </div>
                                                </div>
                                                <div className="help-item">
                                                    <span className="help-icon">🔄</span>
                                                    <div>
                                                        <strong>Problème persistant ?</strong>
                                                        <p>Contactez notre support technique</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </details>
                                </div>

                                {/* Actions supplémentaires */}
                                <div className="help-actions">
                                    <button
                                        className="help-action-btn"
                                        onClick={() => window.open('mailto:support@adscity.net', '_blank')}
                                    >
                                        <Mail size={16} />
                                        Contacter le support
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Card>
                                <CardContent>
                                    <CardDescription>
                                        Entrez un nouveau numéro, nous vous enverrons un code de vérification.
                                    </CardDescription>
                                    <div className="form-group">
                                        <div className="input-wrapper">
                                            <Phone className="input-icon" />
                                            <PhoneInput
                                                country="ru"
                                                specialLabel={null}
                                                onlyCountries={['ru']}
                                                value={newPhone}
                                                onChange={handlePhoneChange}
                                                inputClass={`phone-input ${errors?.phoneNumber ? 'error' : ''}`}
                                                containerClass="phone-container"
                                                buttonClass="phone-button"
                                            />
                                        </div>
                                        {errors?.phoneNumber && <span className="error-message">{errors?.phoneNumber}</span>}
                                    </div>

                                    <div style={{ height: '15px' }} />

                                    <div div className="captcha-wrapper">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={RECAPTCHA_SITE_KEY}
                                            onChange={handleCaptchaChange}
                                            theme="light"
                                        />
                                        {errors?.captcha && <span className="error-message">{errors?.captcha}</span>}
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="form-navigation">
                                        <div className="form-navigation">
                                            <button type="button" className="prev" onClick={{}}>
                                                Annuler
                                            </button>
                                            <button type="submit" className="submit-button" onClick={{}}>
                                                Continuer
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ show: false, type: '', message: '' })}
            />
        </div>
    );
};
