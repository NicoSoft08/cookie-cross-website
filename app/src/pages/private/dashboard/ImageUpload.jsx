import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../../../components/ui/Toast";
import { CloudDownload, X } from "lucide-react";
import { storageService } from "../../../services/storages";
import '../../../styles/dashboard/SelectCategory.scss';

const stepMapping = {
    'category-select': 1,
    'details-provider': 2,
    'image-uploader': 3,
    'location-picker': 4,
    'form-review': 5,
};

const reverseStepMapping = {
    1: 'category-select',
    2: 'details-provider',
    3: 'image-uploader',
    4: 'location-picker',
    5: 'form-review',
};

const MAX_FILE_SIZE_MB = 10; // 10MB maximum file size

export default function ImageUpload({ formData, onChange, currentUser }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stepParam = searchParams.get('step') || 'image-uploader';
    const [step, setStep] = useState(stepMapping[stepParam] || 3);
    const [previewImage, setPreviewImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    const getMaxPhotos = () => {
        if (!currentUser?.storeId && !currentUser?.store) {
            return 3;
        }

        const plan = currentUser.store?.slug || 'basic'; // fallback
        switch (plan) {
            case 'basic':
                return 5;
            case 'premium':
                return 8;
            case 'pro':
                return 10;
            default:
                return 3;
        }
    };

    const maxPhotos = getMaxPhotos();

    // Function to validate file types
    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSizeMB = MAX_FILE_SIZE_MB;

        if (!validTypes.includes(file.type)) {
            return { isValid: false, reason: 'type' };
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            return { isValid: false, reason: 'size' };
        }

        return { isValid: true };
    };

    const handleImageUpload = async (filesArray) => {
        if (!filesArray || filesArray.length === 0) return;

        // Validation initiale
        const validationResults = filesArray.map(validateFile);
        const validFiles = filesArray.filter((_, i) => validationResults[i].isValid);
        const invalidFiles = filesArray.filter((_, i) => !validationResults[i].isValid);

        // Gestion des erreurs de validation
        if (invalidFiles.length > 0) {
            const errorMessages = [];
            const typeCount = validationResults.filter(r => r.reason === 'type').length;
            const sizeCount = validationResults.filter(r => r.reason === 'size').length;

            if (typeCount) errorMessages.push(
                `${typeCount} fichier(s) - Formats acceptés: JPG, JPEG, PNG, WEBP`
            );
            if (sizeCount) errorMessages.push(
                `${sizeCount} fichier(s) - Taille max: ${MAX_FILE_SIZE_MB}MB`
            );

            setToast({
                show: true,
                message: `Fichiers rejetés: ${errorMessages.join(' | ')}`,
                type: 'error',
                duration: 5000
            });
        }

        if (validFiles.length === 0) return;

        // Vérification limite d'images
        const currentImages = formData.images || [];
        const availableSlots = maxPhotos - currentImages.length;

        if (availableSlots <= 0) {
            setToast({
                show: true,
                message: `Maximum ${maxPhotos} images autorisées.`,
                type: 'error'
            });
            return;
        }

        const filesToUpload = validFiles.slice(0, availableSlots);
        setIsUploading(true);

        try {
            // Création des promesses d'upload avec limitation de parallélisme
            const uploadPromises = filesToUpload.map(file =>
                uploadSingleImage(file)
            );

            // Exécution parallèle contrôlée
            const results = await Promise.allSettled(uploadPromises);

            // Traitement des résultats
            const uploadedUrls = [];
            const failedUploads = [];

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    uploadedUrls.push(result.value);
                } else {
                    failedUploads.push(result.reason);
                }
            });

            // Mise à jour de l'état
            if (uploadedUrls.length > 0) {
                const newImages = [...currentImages, ...uploadedUrls].slice(0, maxPhotos);
                onChange(prev => ({ ...prev, images: newImages }));
            }

            // Feedback utilisateur
            if (uploadedUrls.length > 0) {
                setToast({
                    show: true,
                    message: `${uploadedUrls.length} image(s) téléchargée(s) avec succès.`,
                    type: 'success'
                });
            }

            if (failedUploads.length > 0) {
                console.error("Échecs de téléchargement:", failedUploads);
                setToast({
                    show: true,
                    type: 'error',
                    message: `${failedUploads.length} image(s) échouées. Réessayez.`,
                    duration: 5000
                });
            }

        } catch (error) {
            console.error("Erreur globale du téléchargement", error);
            setToast({
                show: true,
                type: 'error',
                message: "Erreur système lors de l'upload."
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Fonction utilitaire pour un seul upload
    const uploadSingleImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await storageService.uploadPostImage(
                formData,
                localStorage.getItem('accessToken')
            );

            if (!res.success) {
                throw new Error(res.message || 'Échec du téléchargement');
            }

            return res.imageUrl;
        } catch (error) {
            throw new Error(`[${file.name}] ${error.message}`);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleImageUpload(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleImageUpload(files);
    };

    const handleRemoveImage = (index) => {
        onChange(prev => {
            const updatedImages = [...prev.images];
            const removed = updatedImages.splice(index, 1);
            // Libère l'URL temporaire
            if (removed[0]?.startsWith('blob:')) {
                URL.revokeObjectURL(removed[0]);
            }
            return { ...prev, images: updatedImages };
        });
    };

    useEffect(() => {
        const stepParam = searchParams.get('step');
        const mappedStep = stepMapping[stepParam];

        if (mappedStep) {
            setStep(mappedStep);
        } else {
            navigate('/dashboard/posts/new?step=details-provider', { replace: true });
        }
    }, [searchParams, navigate]);

    // Gère les étapes du formulaire
    const nextStep = () => {
        const next = step + 1;
        const stepKey = reverseStepMapping[next] || 'location-picker';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    const prevStep = () => {
        const prev = Math.max(step - 1, 1);
        const stepKey = reverseStepMapping[prev] || 'details-provider';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    return (
        <div className="image-upload-form">
            <div className="upload-instructions">
                Cliquez ou glissez jusqu'à {maxPhotos} image{maxPhotos > 1 ? 's' : ''}
            </div>

            {previewImage && (
                <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
                    <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="Preview" />
                        <X className="close-preview" onClick={() => setPreviewImage(null)} />
                    </div>
                </div>
            )}

            <div
                className={`upload-area ${isUploading ? 'uploading' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                tabIndex={0}
                role="button"
                onKeyPress={(e) => e.key === 'Enter' && fileInputRef.current.click()}
            >
                <CloudDownload className="upload-icon" />
                <p className="upload-text">{isUploading ? 'Téléchargement...' : 'Cliquez ou glissez vos images ici'}</p>
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                />
            </div>

            <div className="image-upload-grid">
                {formData.images && formData.images.map((image, index) => (
                    <div className="image-container" key={index}>
                        <img src={image} alt={`upload-${index}`} className="uploaded-image" />
                        <X
                            className="remove-icon"
                            onClick={() => handleRemoveImage(index)}
                        />
                    </div>
                ))}
            </div>

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
    )
}
