import { useEffect, useState } from "react";
import Toast from "../../../components/ui/Toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GlobeIcon, LockIcon, UsersIcon } from "lucide-react";
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

const audienceOptions = [
    { value: 'PUBLIC', label: 'Public', description: 'Visible par tout le monde', icon: <GlobeIcon /> },
    { value: 'FOLLOWERS', label: 'Abonnés uniquement', description: 'Uniquement les abonnés verront cette annonce', icon: <UsersIcon /> },
    { value: 'ONLY_ME', label: 'Moi uniquement', description: 'Annonce privée', icon: <LockIcon /> }
];


export default function Audience({ formData, setFormData, currentUser }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stepParam = searchParams.get('step') || 'details-provider';
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [step, setStep] = useState(stepMapping[stepParam] || 5);

    useEffect(() => {
        const stepParam = searchParams.get('step');
        const mappedStep = stepMapping[stepParam];

        if (mappedStep) {
            setStep(mappedStep);
        } else {
            navigate('/dashboard/posts/new?step=category-select', { replace: true });
        }
    }, [searchParams, navigate]);

    // Gère les étapes du formulaire
    const handleSelect = (value) => {
        setFormData(prev => ({
            ...prev,
            audience: value
        }));
    };

    const nextStep = () => {
        if (!formData.audience) {
            setToast({ show: true, type: 'error', message: "Veuillez sélectionner une audience." });
            return;
        }

        const next = step + 1;
        const stepKey = reverseStepMapping[next] || 'image-uploader';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    const prevStep = () => {
        const prev = Math.max(step - 1, 1);
        const stepKey = reverseStepMapping[prev] || 'location-picker';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    return (
        <div className="audience">
            <h2 className="form-title">Visibilité de l’annonce</h2>
            <p className="form-subtitle">Choisissez qui pourra voir cette annonce une fois publiée.</p>

            <div className="audience-options">
                {audienceOptions.map((opt) => {
                    const isDisabled = opt.value === 'FOLLOWERS' && !currentUser?.storeId;
                    const isSelected = formData.audience === opt.value;

                    return (
                        <button
                            type="button"
                            key={opt.value}
                            onClick={() => !isDisabled && handleSelect(opt.value)}
                            className={`audience-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                            disabled={isDisabled}
                        >
                            <div className="icon">{opt.icon}</div>
                            <div className="text">
                                <div className="label">{opt.label}</div>
                                <div className="description">
                                    {isDisabled
                                        ? "Créez une boutique pour activer cette option"
                                        : opt.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="form-navigation">
                <button type="button" className="prev" onClick={prevStep}>
                    Retour
                </button>
                <button type="button" className="next" onClick={nextStep}>
                    Suivant
                </button>
            </div>

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ show: false, type: '', message: '' })}
            />
        </div>
    )
}
