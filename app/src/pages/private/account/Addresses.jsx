import { ChevronLeft, ChevronRight, LucideMapPinned, MapPinHouse } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import '../../../styles/account/PersoInfo.scss';
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader } from "../../../components/ui/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Loading from "../../../components/ui/Loading";
import { userService } from "../../../services/users";

export default function Addresses() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [homeAddress, setHomeAddress] = useState(currentUser?.address || '');
    const [workAddress, setWorkAddress] = useState(currentUser?.workAddress || '');
    const [editHomeAddress, setEditHomeAddress] = useState(false);
    const [editWorkAddress, setEditWorkAddress] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [loading, setLoading] = useState(false);

    console.log(typeParam);

    const formatHeader = () => {
        switch (typeParam) {
            case 'home':
                return 'Domicile'
            case 'working-address':
                return 'Travail'
            default:
                return null
        }
    };

    const validateHomeAddress = () => {
        const errors = {}

        if (!homeAddress.trim()) {
            errors.homeAddress = "Veuillez renseigner une adresse de domicile"
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const validateWorkAddress = () => {
        const errors = {}

        if (!workAddress.trim()) {
            errors.workAddress = "Veuillez renseigner une adresse de travail"
        }

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleChangeHomeAddress = (e) => {
        const value = e.target.value;
        setHomeAddress(value);
    };

    const handleChangeWorkAddress = (e) => {
        const value = e.target.value;
        setWorkAddress(value);
    };

    const handleSaveHomeAddress = async (e) => {
        e.preventDefault();
        if (!validateHomeAddress()) return;

        try {
            if (!currentUser?.isActive) {
                setToast({
                    show: true,
                    type: 'error',
                    message: "Votre compte est désactivé"
                });
                return;
            }

            setLoading(true);

            const res = await userService.updateUserHomeAddress(
                currentUser.id,
                localStorage.getItem('accessToken'),
                homeAddress
            );

            if (res.success) {
                setLoading(false);
                navigate('/account/profile')
            }
        } catch (error) {
            throw new Error(error)
        }
    };

    const handleSaveWorkAddress = async (e) => {
        e.preventDefault();
        if (!validateWorkAddress()) return;

        try {
            if (!currentUser?.isActive) {
                setToast({
                    show: true,
                    type: 'error',
                    message: "Votre compte est désactivé"
                });
                return;
            }

            setLoading(true);

            const res = await userService.updateUserWorkAddress(
                currentUser.id,
                localStorage.getItem('accessToken'),
                homeAddress
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
        <div className="addresses">
            <div className="page-header">
                <div className="back" onClick={() => navigate('/account/profile')}>
                    <ChevronLeft size={24} />
                </div>
                <h2>{formatHeader(typeParam)}</h2>
            </div>

            {typeParam === 'home' && (
                <div className="info-card">
                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Vos adresses personnelle et professionnelle sont utilisées pour personnaliser
                                votre expérience dans l'ensemble des produits AdsCity et à des fins publicitaires,
                                comme décrit dans les règles de confidentialité de AdsCity. <Link>
                                    En savoir plus <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                                </Link>
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="account-section">
                                {typeParam === 'home' && editHomeAddress ? (
                                    <div className="form">
                                        <div className="form-group">
                                            <div className="input-wrapper">
                                                <MapPinHouse className="input-icon" />
                                                <input
                                                    className={`form-input ${errors.homeAddress ? 'error' : ''} ${homeAddress ? 'filled' : ''}`}
                                                    type="text"
                                                    name="homeAddress"
                                                    id="homeAddress"
                                                    value={homeAddress}
                                                    onChange={handleChangeHomeAddress}
                                                    autoComplete='address-level1'
                                                    aria-describedby={errors.homeAddress ? 'homeAddress-error' : undefined}
                                                />
                                            </div>
                                            {errors.homeAddress && (
                                                <div id="homeAddress-error" className="error-message" role="alert">
                                                    {errors.homeAddress}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="prev" onClick={() => setEditHomeAddress(false)}>
                                                Annuler
                                            </button>

                                            <button
                                                className="submit-button"
                                                onClick={handleSaveHomeAddress}
                                                disabled={loading}
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
                                        onClick={() => setEditHomeAddress(true)}
                                    >
                                        <div className="account-info">
                                            <h6 className="account-title">Domicile</h6>
                                            {currentUser?.address ? (
                                                <p className="account-description">{currentUser?.address}</p>
                                            ) : (
                                                <p className="account-description">Non définie</p>
                                            )}
                                        </div>
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {typeParam === 'working-address' && (
                <div className="info-card">
                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Vos adresses personnelle et professionnelle sont utilisées pour personnaliser
                                votre expérience dans l'ensemble des produits AdsCity et à des fins publicitaires,
                                comme décrit dans les règles de confidentialité de AdsCity. <Link>
                                    En savoir plus <FontAwesomeIcon stroke='none' icon={faQuestionCircle} />
                                </Link>
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="account-section">
                                {typeParam === 'working-address' && editWorkAddress ? (
                                    <div className="form">
                                        <div className="form-group">
                                            <div className="input-wrapper">
                                                <LucideMapPinned className="input-icon" />
                                                <input
                                                    className={`form-input ${errors.workAddress ? 'error' : ''} ${workAddress ? 'filled' : ''}`}
                                                    type="text"
                                                    name="workAddress"
                                                    id="workAddress"
                                                    value={workAddress}
                                                    onChange={handleChangeWorkAddress}
                                                    autoComplete='address-level2'
                                                    aria-describedby={errors.workAddress ? 'workAddress-error' : undefined}
                                                />
                                            </div>
                                            {errors.workAddress && (
                                                <div id="workAddress-error" className="error-message" role="alert">
                                                    {errors.workAddress}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-navigation">
                                            <button type="button" className="prev" onClick={() => setEditWorkAddress(false)}>
                                                Annuler
                                            </button>

                                            <button
                                                className="submit-button"
                                                onClick={handleSaveWorkAddress}
                                                disabled={loading}
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
                                        onClick={() => setEditWorkAddress(true)}
                                    >
                                        <div className="account-info">
                                            <h6 className="account-title">Travail</h6>
                                            {currentUser?.workAddress ? (
                                                <p className="account-description">{currentUser?.workAddress}</p>
                                            ) : (
                                                <p className="account-description">Non définie</p>
                                            )}
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
