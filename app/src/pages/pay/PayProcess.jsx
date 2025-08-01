import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentService } from "../../services/payment";
import Loading from "../../components/ui/Loading";

const paymentMethods = [
    {
        id: 'orange_money',
        label: '🟠 Orange Money',
        description: 'Payez via Orange Money Côte d’Ivoire',
        details: {
            type: 'mobile_money',
            operator: 'Orange CI',
            number: '+2250700000000',
            name: 'AdsCity CI'
        }
    },
    {
        id: 'mtn_money',
        label: '🟡 MTN Mobile Money',
        description: 'Payez via MTN Money',
        details: {
            type: 'mobile_money',
            operator: 'MTN CI',
            number: '+2250500000000',
            name: 'AdsCity CI'
        }
    },
    {
        id: 'bank_transfer',
        label: '🏦 Virement Bancaire',
        description: 'Payez par virement bancaire local',
        details: {
            type: 'bank',
            bankName: 'NSIA Banque CI',
            accountNumber: 'CI00001234567890000001',
            beneficiary: 'ADSCITY CI',
            swift: 'NSIACIAB'
        }
    }
];


export default function PayProcess() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const paymentId = params.get('paymentId');

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log(window.location.href);

    useEffect(() => {
        if (!paymentId) {
            navigate('/plans');
        }
    }, [paymentId, navigate]);

    useEffect(() => {
        async function fetchPayment() {
            try {
                const res = await paymentService.getPaymentById(
                    localStorage.getItem('accessToken'),
                    paymentId
                );
                if (res.success) {
                    setPayment(res.data);
                } else {
                    navigate("/plans");
                }
            } catch (err) {
                console.error("Erreur:", err);
                navigate("/plans");
            } finally {
                setLoading(false);
            }
        }

        fetchPayment();
    }, [paymentId, navigate]);

    const handleConfirmPayment = async () => {
        try {
            const res = await paymentService.confirmPayment(
                localStorage.getItem('accessToken'),
                paymentId
            );
            if (res.success) {
                navigate("/pay/success");
            } else {
                alert("Paiement échoué.");
            }
        } catch (err) {
            alert("Erreur de confirmation.");
        }
    };

    function handlePaymentMethodSelect(methodId) {
        console.log("Méthode choisie:", methodId);

        // Tu peux rediriger vers une route /pay/confirm ou appeler une API pour continuer le paiement
        // navigate(`/pay/confirm?paymentId=${paymentId}&method=${methodId}`);
    }

    if (loading) return <Loading />

    return (
        <div className="pay-process-page">
            <h1>💳 Confirmation de paiement</h1>
            <div className="pay-summary">
                <p><strong>Boutique :</strong> {payment.store.name}</p>
                <p><strong>Plan :</strong> {payment.plan.name}</p>
                <p><strong>Montant :</strong> {payment.amount} {payment.currency}</p>
                <p><strong>Status :</strong> {payment.status}</p>
            </div>

            <h1>Choisissez un moyen de paiement</h1>
            <div className="payment-methods">
                {paymentMethods.map(method => (
                    <div key={method.id} className="payment-method-card">
                        <h3>{method.label}</h3>
                        <p>{method.description}</p>
                        <button
                            onClick={() => handlePaymentMethodSelect(method.id)}
                            className="btn-pay-method"
                        >
                            Sélectionner
                        </button>
                    </div>
                ))}
            </div>

            {payment.status === 'pending' && (
                <button className="btn-confirm" onClick={handleConfirmPayment}>
                    Confirmer et payer
                </button>
            )}
        </div>
    );
};
