import { useEffect, useState } from "react";
import Toast from "../../../components/ui/Toast";
import InputField from "../../../components/ui/InputField";
import Loading from "../../../components/ui/Loading";
import { useNavigate, useSearchParams } from "react-router-dom";
import { schemaService } from "../../../services/form-schema";
import { brandService } from "../../../services/brand";
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

export default function Details({ formData, setFormData }) {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const stepParam = searchParams.get('step') || 'details-provider';
    const [step, setStep] = useState(stepMapping[stepParam] || 2);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});
    const [brands, setBrands] = useState([]);

    console.log(formData)

    useEffect(() => {
        const stepParam = searchParams.get('step');
        const mappedStep = stepMapping[stepParam];

        if (mappedStep) {
            setStep(mappedStep);
        } else {
            navigate('/dashboard/posts/new?step=category-select', { replace: true });
        }
    }, [searchParams, navigate]);

    // ✅ Charger les champs quand la sous-catégorie change
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Chargement en parallèle pour meilleure performance
                const formRes = await schemaService.getFormFieldsBySlug(formData.subcategory);

                if (!formRes.success) throw new Error('Erreur de chargement du formulaire');

                setFields(formRes.fields?.fields || []);
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formData]);

    // ✅ Charger les champs quand la sous-catégorie change
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Chargement en parallèle pour meilleure performance
                const brandsRes = await brandService.getBrandBySlug(formData.subcategory);

                if (!brandsRes.success) throw new Error('Erreur de chargement des marques');

                setBrands(brandsRes.data || []);
            } catch (err) {
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formData]);


    // Helper pour préserver les données valides
    const preserveCompatibleDetails = (existingDetails, newFields) => {
        if (!newFields) return {};

        return Object.fromEntries(
            Object.entries(existingDetails || {})
                .filter(([key]) => newFields.some(f => f.name === key))
        );
    }; // ✅ Dépendance sur subcategory


    const handleChangeDetails = (e) => {
        const { name, value, type, checked } = e.target;

        if (!name) return;

        setFormData((prev) => {
            const updatedFormData = { ...prev };

            if (!updatedFormData.details) {
                updatedFormData.details = {};
            }

            if (type === "checkbox") {
                const currentValues = updatedFormData.details[name] || [];
                if (checked) {
                    updatedFormData.details[name] = [...currentValues, value];
                } else {
                    updatedFormData.details[name] = currentValues.filter((v) => v !== value);
                }
            } else {
                updatedFormData.details[name] = value;
            }

            return updatedFormData;
        });

        // Vérification du champ requis
        const field = fields.find(f => f.name === name);
        if (field?.required) {
            const isEmpty = type === 'checkbox'
                ? (formData.details?.[name]?.length ?? 0) === 0
                : value.trim() === '';

            setErrors(prev => ({
                ...prev,
                [name]: isEmpty ? 'Ce champ est requis.' : ''
            }));
        }
    };

    const validateRequiredFields = () => {
        const newErrors = {};

        fields.forEach((field) => {
            const { name, required, type } = field;
            const value = formData.details?.[name];

            if (required) {
                const isEmpty =
                    (type === 'checkbox' && (!value || value.length === 0)) ||
                    (type !== 'checkbox' && (!value || value.toString().trim() === ''));

                if (isEmpty) {
                    newErrors[name] = 'Ce champ est requis.';
                }
            }
        });

        setErrors(newErrors);

        // Renvoie true si aucune erreur
        return Object.keys(newErrors).length === 0;
    };

    // Gère les étapes du formulaire
    const nextStep = () => {
        const isValid = validateRequiredFields();

        if (!isValid) return; // ⛔️ Stop ici si des champs requis sont vides

        const next = step + 1;
        const stepKey = reverseStepMapping[next] || 'image-uploader';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    const prevStep = () => {
        const prev = Math.max(step - 1, 1);
        const stepKey = reverseStepMapping[prev] || 'category-select';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    // ✅ Vérifications de sécurité
    if (!formData.subcategory) {
        return (
            <div className="details">
                <div className="no-subcategory">
                    <p>Veuillez d'abord sélectionner une sous-catégorie.</p>
                    <button type="button" className="back-button" onClick={prevStep}>
                        Retour à la sélection
                    </button>
                </div>
            </div>
        );
    }

    // Aucun champ disponible
    if (fields.length === 0) {
        return (
            <div className="details">
                <div className="no-fields">
                    <h3>Aucun champ spécifique</h3>
                    <p>Aucun champ spécifique n'est requis pour <strong>{formData.subcategory}</strong>.</p>
                    <div className="form-navigation">
                        <button type="button" className="prev" onClick={prevStep}>
                            Retour
                        </button>
                        <button type="button" className="next" onClick={nextStep}>
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Gestion du chargement
    if (loading) return <Loading />;

    return (
        <div className="details">
            <div className="details-form">
                {fields.map((field, index) => {
                    const { type, name, label, placeholder, options, multiple, required, validation } = field;
                    const value = formData.details?.[name] || '';

                    return (
                        <InputField
                            key={`${name}-${index}`}
                            type={type}
                            name={name}
                            label={label}
                            placeholder={placeholder}
                            options={type === 'brand' ? brands : options}
                            multiple={multiple}
                            required={required}
                            validation={validation} // Passage de la config de validation
                            value={value}
                            onChange={handleChangeDetails}
                            onBlur={(fieldName, error) => {
                                // Mise à jour des erreurs dans le state parent
                                setErrors(prev => ({ ...prev, [fieldName]: error }));
                            }}
                            brands={brands}
                            errors={errors}
                        />
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
