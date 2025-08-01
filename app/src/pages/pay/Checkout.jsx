import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storeService } from "../../services/stores";
import Loading from "../../components/ui/Loading";
import '../../styles/public/Checkout.scss';
import { subscriptionPlanStorage } from "../../utils/subscriptionPlanStorage";
import Modal from "../../components/ui/Modal";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/Card";
import { faCreditCard, faMobile, faUniversity, faWallet } from "@fortawesome/free-solid-svg-icons";
import { alpha_bank, flashsend, moov_money, mtn_money, orange_money, sber_bank, tinkoff_bank, vtb_bank, wave } from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ShoppingBag, Store, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Available payment methods configuration
const paymentMethods = [
    {
        id: 'Bank Transfer',
        label: 'Transfert bancaire',
        icon: faUniversity,
        providers: [
            { id: 'SberBank', name: 'SberBank', icon: sber_bank },
            { id: 'Tinkoff', name: 'Tinkoff', icon: tinkoff_bank },
            { id: 'VTB', name: 'VTB', icon: vtb_bank },
            { id: 'Alpha Bank', name: 'Alpha Bank', icon: alpha_bank }
        ]
    },
    {
        id: 'Mobile Money',
        label: 'Mobile Money',
        icon: faMobile,
        providers: [
            { id: 'Orange Money', name: 'Orange Money', icon: orange_money },
            { id: 'MTN Money', name: 'MTN Money', icon: mtn_money },
            { id: 'Moov Money', name: 'Moov Money', icon: moov_money }
        ]
    },
    {
        id: 'Wallet',
        label: 'Wallet',
        icon: faWallet,
        providers: [
            { id: 'Wave', name: 'Wave', icon: wave },
            { id: 'FlashSend', name: 'FlashSend', icon: flashsend }
        ]
    }
];

export default function Checkout() {
    const { currentUser } = useAuth();
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const storeId = params.get('storeId');
    const planSlug = params.get('plan');
    console.log("Checkout params:", { storeId, planSlug });

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [dropdownOpenForMethod, setDropdownOpenForMethod] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Debugging effect
    useEffect(() => {
        console.log('Selected Method:', selectedMethod);
        console.log('Selected Provider:', selectedProvider);
        console.log('Open Dropdown:', dropdownOpenForMethod);
    }, [selectedMethod, selectedProvider, dropdownOpenForMethod]);


    useEffect(() => {
        async function fetchData() {
            try {
                if (!storeId || !planSlug) {
                    return navigate('/plans'); // redirection sécurité
                }

                setLoading(true);

                const storeRes = await storeService.getStoreById(storeId);

                if (storeRes.success) {
                    setStore(storeRes.data);
                    setLoading(false);
                } else {
                    navigate('/plans');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                navigate('/plans');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [storeId, planSlug, navigate]);


    const plan = subscriptionPlanStorage.get();
    console.log("Plan:", plan);

    const validateFields = (method, provider) => {
        const newErrors = {};

        if (!method) newErrors.method = "Veuillez choisir un moyen de paiement.";

        const selected = paymentMethods.find(m => m.id === method);
        if (selected?.providers?.length > 0 && !provider) {
            newErrors.provider = "Veuillez choisir un fournisseur.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle payment method selection
    const handleMethodChange = (methodId) => {
        console.log('Method changed to:', methodId);
        const method = paymentMethods.find(m => m.id === methodId);

        setSelectedMethod(methodId);
        setSelectedProvider(null);
        setTouched(prev => ({ ...prev, method: true }));

        // Si la méthode a des fournisseurs, on ouvre directement le dropdown
        if (method?.providers?.length > 0) {
            setDropdownOpenForMethod(methodId);
        } else {
            setDropdownOpenForMethod(null);
        }

        validateFields(methodId, null);
    };

    const handleProviderChange = (methodId, providerId) => {
        setSelectedProvider(providerId);
        setDropdownOpenForMethod(null);
        setTouched(prev => ({ ...prev, provider: true }));
        validateFields(selectedMethod, providerId);
    };

    const handleSubmit = () => {
        const isValid = validateFields(selectedMethod, selectedProvider);
        if (isValid) {
            // Process payment

            // Close the modal
            setIsOpen(false);
        }
    };

    const toggleDropdown = (methodId) => {
        setDropdownOpenForMethod(prev => prev === methodId ? null : methodId);
    };

    if (loading) return <Loading />;

    return (
        <div className="checkout-page">
            <h1 className="checkout-title">Résumé de la souscription</h1>

            <div className="checkout-card">
                <div className="checkout-section">
                    <h2 className="section-title"><Store size={20} /> Boutique</h2>
                    <div className="info-row"><span>Nom :</span><strong>{store.name}</strong></div>
                    <div className="info-row"><span>Catégorie :</span><strong>{store.category}</strong></div>
                </div>

                <div className="checkout-section">
                    <h2 className="section-title"><ShoppingBag size={20} /> Abonnement</h2>
                    <div className="info-row"><span>Nom :</span><strong>{plan.name}</strong></div>
                    {/* <div className="info-row"><span>Description :</span><strong>{plan.description}</strong></div> */}
                    <div className="info-row"><span>Prix :</span><strong>{plan.price} {plan.currency}</strong></div>
                    <div className="info-row"><span>Durée :</span><strong>{plan.duration} jours</strong></div>
                </div>

                <div className="checkout-section">
                    <h2 className="section-title"><User size={20} /> Souscripteur</h2>
                    <div className="info-row"><span>Nom :</span><strong>{currentUser.firstName} {currentUser.lastName}</strong></div>
                    {/* <div className="info-row"><span>Description :</span><strong>{plan.description}</strong></div> */}
                    <div className="info-row"><span>Email :</span><strong>{currentUser.email}</strong></div>
                    <div className="info-row"><span>Téléphone :</span><strong>{currentUser.phoneNumber}</strong></div>
                </div>

                <div className="checkout-footer">
                    <button className="btn-pay" onClick={() => setIsOpen(true)}>
                        Procéder au paiement
                    </button>
                </div>
            </div>

            <Modal title="Paiement" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <Card>
                    <CardHeader>
                        <FontAwesomeIcon icon={faCreditCard} />
                        Choose a payment method
                    </CardHeader>
                    <CardContent>
                        <div className="payment-methods-container">
                            {paymentMethods.map(method => (
                                <div className="payment-method" key={method.id}>
                                    <label className={`method-label ${selectedMethod === method.id ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={selectedMethod === method.id}
                                            onChange={() => handleMethodChange(method.id)}
                                            className="method-radio"
                                        />
                                        <FontAwesomeIcon icon={method.icon} className="method-icon" />
                                        <span className="method-name">{method.label}</span>
                                    </label>

                                    {/* Provider selection - fixed this part */}
                                    {selectedMethod === method.id && method.providers && method.providers.length > 0 && (
                                        <div className="payment-providers">
                                            <div
                                                className={`provider-select ${errors.provider && touched.provider ? 'error' : ''}`}
                                                aria-expanded={dropdownOpenForMethod === method.id}
                                                aria-haspopup="listbox"
                                            >
                                                <div
                                                    className="select-selected"
                                                    onClick={() => toggleDropdown(method.id)}
                                                    role="button"
                                                    tabIndex="0"
                                                    aria-label="Select payment provider"
                                                >
                                                    {selectedProvider ? (
                                                        <div className="provider-option">
                                                            {method.providers.find(p => p.id === selectedProvider)?.icon && (
                                                                <img
                                                                    src={method.providers.find(p => p.id === selectedProvider)?.icon}
                                                                    alt=""
                                                                    className="provider-logo"
                                                                />
                                                            )}
                                                            <span>{method.providers.find(p => p.id === selectedProvider)?.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span>Select a provider</span>
                                                    )}
                                                </div>

                                                {dropdownOpenForMethod === method.id && (
                                                    <ul className="provider-options" role="listbox">
                                                        {method.providers.map(provider => (
                                                            <li
                                                                key={provider.id}
                                                                className={`provider-option ${selectedProvider === provider.id ? 'selected' : ''}`}
                                                                onClick={() => handleProviderChange(method.id, provider.id)}
                                                                role="option"
                                                                aria-selected={selectedProvider === provider.id}
                                                            >
                                                                {provider.icon && (
                                                                    <img src={provider.icon} alt="" className="provider-logo" />
                                                                )}
                                                                <span>{provider.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            {errors.provider && touched.provider && (
                                                <div className="error-message" role="alert">
                                                    {errors.provider}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors.method && touched.method && (
                            <div className="error-message payment-method-error" role="alert">
                                {errors.method}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {selectedMethod && (
                            <div className="payment-summary">
                                Méthode : <strong>{selectedMethod}</strong>
                                {selectedProvider && <> | Fournisseur : <strong>{selectedProvider}</strong></>}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                const isValid = validateFields(selectedMethod, selectedProvider);
                                if (isValid) {
                                    // 👇 Appel backend ou redirection ici
                                    console.log("Paiement validé :", { selectedMethod, selectedProvider });
                                    setIsOpen(false);
                                }
                            }}
                            className="submit-button"
                        >
                            Confirm Payment
                        </button>
                    </CardFooter>
                </Card>
            </Modal>
        </div>

    );
};
