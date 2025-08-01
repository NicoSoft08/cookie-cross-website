import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import Logo from '../../components/ui/Logo';
import { logos } from '../../config';
import Avatar from '../../components/ui/Avatar';
import { Lock } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { authService } from '../../services/auth';
import '../../styles/auth/VerifyIdentity.scss';

export default function VerifyIdentity() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const action = searchParams.get('action');
    console.log(action)
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const name = `${currentUser.firstName} ${currentUser.lastName}`;

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError('');
    };

    const handleShowPasswordToggle = (e) => {
        setShowPassword(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await authService.verifyPassword(
                localStorage.getItem('accessToken'),
                password,
            );

            if (res.success) {
                if (action === 'recovery-email') {
                    navigate(`/account/security/email-addresses/add?type=${action}`)
                } else if (action === 'edit-phone') {
                    navigate(`/account/profile/personal-info/phone-number?action=${action}`)
                }
            } else {
                setError(res.message);
            }
        } catch (error) {
            console.log(error);
            setError('Une erreur est survenue. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='verify-identity'>
            <div className="container">
                <div className='logo'>
                    <Logo src={logos.letterWhiteBgBlue} size="lg" alt="AdsCity" onclick={() => navigate('/')} />
                </div>
                <div id="user-details">
                    <div>
                        <h2> {name} </h2>

                        <button>
                            <Avatar name={name} size='sm' />
                            <span> {currentUser.email} </span>
                        </button>
                    </div>
                </div>
                <div className="form">
                    <p>Pour continuer, veuillez confirmer votre identité</p>
                    <div className="form-group">
                        <label htmlFor="password" className='form-label'>Mot de passe</label>

                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                className={`form-input ${error ? 'error' : ''} ${password ? 'filled' : ''}`}
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Entrez votre mot de passe"
                                required
                                aria-describedby={error ? 'password-error' : undefined}
                            />
                        </div>

                        {error && (
                            <div id="email-error" className="error-message" role="alert">
                                {error}
                            </div>
                        )}

                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="showPassword"
                                checked={showPassword}
                                onChange={handleShowPasswordToggle}
                                className="checkbox-input"
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">
                                Afficher le mot de passe
                            </span>
                        </label>
                    </div>

                    <div className="form-group">
                        <span className="other-method">
                            Essayez une autre méthode
                        </span>

                        <button className="next" disabled={loading} type='submit' onClick={handleSubmit}>
                            {loading ? (
                                <>
                                    <Spinner variant="bounce" size={15} color="#fff" />
                                </>
                            ) : (
                                <span>
                                    Continuer
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
