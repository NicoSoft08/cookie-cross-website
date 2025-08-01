import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../../../components/ui/Toast";
import InputField from "../../../components/ui/InputField";
import '../../../styles/dashboard/SelectCategory.scss';

const stepMapping = {
    'category-select': 1,
    'details-provider': 2,
    'image-uploader': 3,
    'location-picker': 4,
    'audience-selector': 5,
    'form-review': 6,
};

const reverseStepMapping = {
    1: 'category-select',
    2: 'details-provider',
    3: 'image-uploader',
    4: 'location-picker',
    5: 'audience-selector',
    6: 'form-review',
};

export default function Location({ formData, setFormData, currentUser }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stepParam = searchParams.get('step') || 'location-picker';
    const [step, setStep] = useState(stepMapping[stepParam] || 3);
    const [usePersonalInfo, setUsePersonalInfo] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    const [errors, setErrors] = useState({});

    const [location, setLocation] = useState(() => {
        const loc = formData?.location ?? {};
        return {
            country: loc.country || '',
            city: loc.city || '',
            address: loc.address || ''
        };
    });

    useEffect(() => {
        const stepParam = searchParams.get('step');
        const mappedStep = stepMapping[stepParam];

        if (mappedStep) {
            setStep(mappedStep);
        } else {
            navigate('/dashboard/posts/new?step=image-uploader', { replace: true });
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        if (usePersonalInfo && currentUser && typeof currentUser === 'object') {
            const filledLocation = {
                country: currentUser?.country || '',
                city: currentUser?.city || '',
                address: currentUser?.address || ''
            };
            setLocation(filledLocation);
            setFormData(prev => ({
                ...prev,
                location: filledLocation
            }));
        }
    }, [usePersonalInfo, currentUser, setFormData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocation(prev => {
            const updated = { ...prev, [name]: value };
            setFormData(data => ({
                ...data,
                location: updated
            }));
            return updated;
        });
    };

    // Gère les étapes du formulaire
    const nextStep = () => {
        if (!location.country || !location.city || !location.address) {
            setToast({
                show: true,
                type: 'error',
                message: 'Tous les champs de localisation sont requis.'
            });
            return;
        }

        const next = step + 1;
        const stepKey = reverseStepMapping[next] || 'audience-selector';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    const prevStep = () => {
        const prev = Math.max(step - 1, 1);
        const stepKey = reverseStepMapping[prev] || 'image-uploader';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };
    return (
        <div className="location-form">
            <div className="form-group">
                <InputField
                    label={'Pays'}
                    type='text'
                    name={'country'}
                    value={location.country}
                    onChange={handleChange}
                    placeholder={"Ex: Côte d'Ivoire"}
                    required={true}
                    // readOnly={true}
                    onBlur={(fieldName, error) => {
                        // Mise à jour des erreurs dans le state parent
                        setErrors(prev => ({ ...prev, [fieldName]: error }));
                    }}
                    errors={errors}
                />
            </div>

            <div className="form-group">
                <InputField
                    label={'Ville'}
                    type='text'
                    name={'city'}
                    value={location.city}
                    onChange={handleChange}
                    placeholder={"Ex: Abidjan"}
                    required={true}
                    onBlur={(fieldName, error) => {
                        // Mise à jour des erreurs dans le state parent
                        setErrors(prev => ({ ...prev, [fieldName]: error }));
                    }}
                    errors={errors}
                />
            </div>

            <div className="form-group">
                <InputField
                    label={'Adresse complète'}
                    type='text'
                    name={'address'}
                    value={location.address}
                    onChange={handleChange}
                    placeholder={"Ex: Cocody Angré 7ème tranche"}
                    onBlur={(fieldName, error) => {
                        // Mise à jour des erreurs dans le state parent
                        setErrors(prev => ({ ...prev, [fieldName]: error }));
                    }}
                    errors={errors}
                />
            </div>

            <label className="checkbox-wrapper">
                <input
                    type="checkbox"
                    name="usePersonalInfo"
                    checked={usePersonalInfo}
                    onChange={() => setUsePersonalInfo(!usePersonalInfo)}
                    className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                    Utiliser mes informations personnelles
                </span>
            </label>

            <div className="form-navigation">
                <button type="button" className="prev" onClick={prevStep}>
                    Retour
                </button>
                <button type="button" className="next" onClick={nextStep}>
                    Suivant
                </button>
            </div>

            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: '', message: '' })} />
        </div>
    );
};
