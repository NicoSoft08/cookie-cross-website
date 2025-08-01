import { ChevronRight, LockKeyhole, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/ui/Avatar';
import { calculateProfileStatus } from '../../../utils/calculateProfileStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import '../../../styles/account/Profile.scss';

const ProfileCompletionBar = ({ user }) => {
    const { percent, missing } = calculateProfileStatus(user);

    return (
        <div className="profile-completion">
            <div className="label">
                <strong>Profil :</strong> {percent}% complété
            </div>
            <div className="bar">
                <div
                    className={`progress ${percent < 50 ? 'low' : percent < 80 ? 'medium' : 'high'}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>

            {percent < 100 && (
                <div className="incomplete-tasks">
                    <p className="hint">Pour améliorer votre profil, complétez :</p>
                    <ul>
                        {missing.map((item, index) => (
                            <li key={index}>• {item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default function Profile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const name = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Utilisateur inconnu';

    const formatGender = (gender) => {
        switch (gender) {
            case 'MALE':
                return 'Homme'
            case 'FEMALE':
                return 'Femme'
            default:
                return null
        }
    }

    const gender = formatGender(currentUser.gender);

    return (
        <div className='account-profile'>
            <div>
                Gérez vos informations personnelles et contrôlez qui peut les consulter lorsque vous utilisez votre profil de compte AdsCity principal sur les services AdsCity.

                <div className="privacy-indicator">
                    {[
                        { id: 1, icon: <LockKeyhole size={20} />, label: "Vous uniquement" },
                        { id: 2, icon: <Users size={20} />, label: "Tout le monde" }
                    ].map((item) => (
                        <div key={item.id} className="privacy-indicator-item">
                            <div className="privacy-indicator-icon">{item.icon}</div>
                            <div className="privacy-indicator-label">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <ProfileCompletionBar user={currentUser} />

            <div>
                <CardHeader>
                    <CardTitle>
                        Les informations de votre profil dans les services AdsCity
                    </CardTitle>
                    <CardDescription>
                        Voici vos informations personnelles et des options pour les gérer.
                        Vous pouvez permettre aux autres utilisateurs d'en voir certaines (par ex. vos coordonnées pour être facilement joignable).
                        Vous pouvez aussi voir un résumé de votre profil.
                    </CardDescription>
                </CardHeader>

                <div style={{ height: '15px' }} />

                <Card>
                    <CardContent>
                        <CardTitle>
                            Informations générales
                        </CardTitle>
                        <CardDescription>
                            Certaines de ces informations peuvent être vues par les autres utilisateurs des services AdsCity. <Link>
                                En savoir plus <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                            </Link>
                        </CardDescription>

                        <div className="account-section">
                            <div className="account-block">
                                <div className="account-info">
                                    <h6 className="account-title">Photo de profil</h6>
                                    <p className="account-description">Une photo de profil permet de personnaliser votre compte</p>
                                </div>
                                <Avatar src={currentUser.avatar} name={name} size="lg" />
                            </div>

                            <div
                                className="account-block account-link"
                                onClick={() => navigate(`personal-info?type=name`)}
                            >
                                <div className="account-info">
                                    <h6 className="account-title">Nom</h6>
                                    <p className="account-description">{name}</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>

                            <div
                                className="account-block account-link"
                                onClick={() => navigate(`personal-info?type=gender`)}
                            >
                                <div className="account-info">
                                    <h6 className="account-title">Genre</h6>
                                    {currentUser.gender ? (
                                        <p className="account-description">{gender}</p>
                                    ) : (
                                        <p className="account-description">Non défini</p>
                                    )}
                                </div>
                                <ChevronRight size={18} />
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div style={{ height: '15px' }} />

                <Card>
                    <CardContent>
                        <CardTitle>
                            Coordonnées
                        </CardTitle>

                        <div className="account-section">
                            <div
                                className="account-block account-link"
                                onClick={() => navigate('/account/security/email-addresses')}
                            >
                                <div className="account-info">
                                    <h6 className="account-title">Adresses e-mail</h6>
                                    <p className="account-description">{currentUser.email}</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>

                            <div
                                className="account-block account-link"
                                onClick={() => navigate(`personal-info?type=phone`)}
                            >
                                <div className="account-info">
                                    <h6 className="account-title">Téléphone</h6>
                                    <p className="account-description">{currentUser.phoneNumber}</p>
                                </div>
                                <ChevronRight size={18} />
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div style={{ height: '15px' }} />

                <Card>
                    <CardContent>
                        <CardTitle>
                            Adresses
                        </CardTitle>
                        <CardDescription>
                            Gérez les adresses associées à votre compte AdsCity. <Link>
                                En savoir plus sur les adresses enregistrées dans votre compte <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                            </Link>
                        </CardDescription>

                        <div className="account-section">
                            <div
                                className="account-block account-link"
                                onClick={() => navigate(`/account/settings/addresses?type=home`)}
                            >
                                <div className="account-info">
                                    <h6 className="account-title">Domicile</h6>
                                    {currentUser.address ? (
                                        <p className="account-description">{currentUser.address}</p>
                                    ) : (
                                        <p className="account-description">Non définie</p>
                                    )}
                                </div>
                                <ChevronRight size={18} />
                            </div>

                            <div 
                            className="account-block account-link"
                             onClick={() => navigate(`/account/settings/addresses?type=working-address`)}
                            >
                                <div className="account-info">
                                    <h6 className="account-title">Travail</h6>
                                    {currentUser.workAddress ? (
                                        <p className="account-description">{currentUser.workAddress}</p>
                                    ) : (
                                        <p className="account-description">Non définie</p>
                                    )}
                                </div>
                                <ChevronRight size={18} />
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
