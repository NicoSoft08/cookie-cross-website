import { ChevronLeft, ChevronRight, Edit2, LockKeyhole, Trash2, User, Users } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { useAuth } from "../../../contexts/AuthContext";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import { userService } from "../../../services/users";
import Loading from "../../../components/ui/Loading";
import '../../../styles/account/PersoInfo.scss';

export default function PersoInfo() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [editName, setEditName] = useState(false);
    const [editGender, setEditGender] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [openActions, setOpenActions] = useState(false);
    const [selectedGender, setSelectedGender] = useState(currentUser.gender || '');
    const [visibility, setVisibility] = useState(currentUser.genderVisibility || 'PRIVATE'); // ou autre valeur par défaut
    const [userName, setUserName] = useState({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
    });
    const typeParam = searchParams.get('type');
    const name = `${currentUser.firstName} ${currentUser.lastName}`;
    const navigate = useNavigate();

    console.log(typeParam);

    const isFormValid = userName.firstName.trim() !== '' && userName.lastName.trim() !== '';

    const genderOptions = [
        { label: "Femme", value: "FEMALE" },
        { label: "Homme", value: "MALE" },
    ];

    const visibilityOptions = [
        { id: "PRIVATE", icon: <LockKeyhole size={20} />, label: "Vous uniquement" },
        { id: "PUBLIC", icon: <Users size={20} />, label: "Tout le monde" }
    ];

    const validateForm = () => {
        const errors = {};

        if (typeParam === 'name') {
            if (!userName.firstName.trim()) {
                errors.firstName = "Le prénom est requis.";
            }

            if (!userName.lastName.trim()) {
                errors.lastName = "Le nom est requis.";
            }
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { value, name } = e.target;

        setUserName((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const formatHeader = () => {
        switch (typeParam) {
            case 'name':
                return 'Nom'
            case 'gender':
                return 'Genre'
            case 'phone':
                return 'Numéro de téléphone'
            case 'edit-phone':
                return 'Modification du numéro de téléphone'
            default:
                return null
        }
    }

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Ici, simule une requête réseau pour enregistrer les données
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Tu pourrais aussi appeler une fonction de ton service (ex: updateUserName)

            // Revenir à la page précédente
            navigate('/account/profile');
            setUserName({
                firstName: '',
                lastName: ''
            })
            setErrors({})
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }


    const handleSaveGender = async () => {
        if (!currentUser.isActive) {
            setToast({
                show: true,
                type: 'error',
                message: "Votre compte est désactivé"
            });
            return;
        }

        if (!selectedGender) {
            setToast({
                show: true,
                type: 'error',
                message: "Veuillez sélectionner un genre"
            });
            return;
        }

        setLoading(true);

        try {
            const res = await userService.updateUserGender(
                currentUser.id,
                localStorage.getItem('accessToken'),
                selectedGender,
                visibility
            );

            if (res.success) {
                setLoading(false);
                navigate('/account/profile')
            }
        } catch (error) {
            throw new Error(error)
        }
    };

    if (loading) return <Loading />

    return (
        <div className="personal-info">
            <div className="page-header">
                <div className="back" onClick={() => navigate('/account/profile')}>
                    <ChevronLeft size={24} />
                </div>
                <h2>{formatHeader(typeParam)}</h2>
            </div>

            {typeParam === 'name' && (
                <div className="info-card">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Qui peut voir votre nom
                            </CardTitle>
                            <CardDescription>
                                Toute personne peut voir cette information lorsqu'elle communique avec vous ou consulte du contenu que vous avez créé sur les services AdsCity. <Link>
                                    En savoir plus <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                                </Link>
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="account-section">
                                {typeParam === 'name' && editName ? (
                                    <div className="form">
                                        <div className="form-group">
                                            <div className="input-wrapper">
                                                <User className="input-icon" />
                                                <input
                                                    className={`form-input ${errors.firstName ? 'error' : ''} ${userName.firstName ? 'filled' : ''}`}
                                                    type="text"
                                                    name="firstName"
                                                    id="firstName"
                                                    value={userName.firstName}
                                                    onChange={handleChange}
                                                    autoComplete="name"
                                                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <div id="firstName-error" className="error-message" role="alert">
                                                    {errors.firstName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <div className="input-wrapper">
                                                <User className="input-icon" />
                                                <input
                                                    className={`form-input ${errors.lastName ? 'error' : ''} ${userName.lastName ? 'filled' : ''}`}
                                                    type="text"
                                                    name="lastName"
                                                    id="lastName"
                                                    value={userName.lastName}
                                                    onChange={handleChange}
                                                    autoComplete="name"
                                                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <div id="firstlastNameName-error" className="error-message" role="alert">
                                                    {errors.lastName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="prev" onClick={() => setEditName(false)}>
                                                Annuler
                                            </button>

                                            <button
                                                className="submit-button"
                                                onClick={handleSave}
                                                disabled={!isFormValid || loading}
                                            >
                                                {loading
                                                    ? <Spinner variant="bounce" size={15} color="#fff" />
                                                    : "Enregistrer"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="account-block account-link"
                                        onClick={() => setEditName(true)}
                                    >
                                        <div className="account-info">
                                            <h6 className="account-title">Nom</h6>
                                            <p className="account-description">{name}</p>
                                        </div>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {typeParam === 'gender' && (
                <div className="info-card">
                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Nous pouvons tenir compte de votre genre pour personnaliser les services AdsCity, y compris dans la manière dont nous nous adressons à vous. <Link>
                                    En savoir plus <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                                </Link>
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="account-section">
                                {typeParam === 'gender' && editGender ? (
                                    <div className="form">
                                        <div className="form-group">
                                            <label className="form-label">Sélectionnez votre genre</label>
                                            <div className="radio-group">
                                                {genderOptions.map(({ label, value }) => (
                                                    <label key={value} className="radio-option">
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value={value}
                                                            checked={selectedGender === value}
                                                            onChange={() => setSelectedGender(value)}
                                                        />
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Qui peut voir votre genre</label>
                                            <div className="privacy-indicator">
                                                {visibilityOptions.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className={`privacy-indicator-item ${visibility === item.id ? 'active' : ''}`}
                                                        onClick={() => setVisibility(item.id)}
                                                    >
                                                        <div className="privacy-indicator-icon">{item.icon}</div>
                                                        <div className="privacy-indicator-label">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="prev" onClick={() => setEditGender(false)}>
                                                Annuler
                                            </button>

                                            <button
                                                className="submit-button"
                                                onClick={handleSaveGender}
                                                disabled={!isFormValid || loading}
                                            >
                                                {loading
                                                    ? <Spinner variant="bounce" size={15} color="#fff" />
                                                    : "Enregistrer"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="account-block account-link"
                                        onClick={() => setEditGender(true)}
                                    >
                                        <div className="account-info">
                                            <h6 className="account-title">Genre</h6>
                                            <p className="account-description">
                                                {currentUser.gender === "FEMALE" ? "Femme" :
                                                    currentUser.gender === "MALE" ? "Homme" : "Non défini"}
                                            </p>
                                        </div>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {typeParam === 'phone' && (
                <div className="info-card">
                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Ce numéro de téléphone a été ajouté à votre compte AdsCity. <Link>
                                    En savoir plus <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                                </Link>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="account-section">
                                {openActions ? (
                                    <div
                                        className="account-block account-link"
                                        onClick={() => setEditName(true)}
                                    >
                                        <p className="account-description">{currentUser.phoneNumber}</p>
                                        <div className="account-info btns">
                                            <button className="edit" onClick={() => navigate(`/auth/verify-identity?action=edit-phone`)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="delete" onClick={() => navigate(`/auth/verify-identity?action=delete-phone`)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="account-block account-link"
                                        onClick={() => setOpenActions(true)}
                                    >
                                        <div className="account-info">
                                            <p className="account-description">{currentUser.phoneNumber}</p>
                                            <h6 className="account-title">
                                                {currentUser.phoneNumberVerified ? "Vérifié" : "Non vérifié"}
                                            </h6>
                                        </div>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
