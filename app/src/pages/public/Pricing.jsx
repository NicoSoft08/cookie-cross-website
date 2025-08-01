import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { planService } from "../../services/plans";
import Loading from "../../components/ui/Loading";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { subscriptionPlanStorage } from "../../utils/subscriptionPlanStorage";
import '../../styles/public/Plans.scss';

const PriceItem = ({ plan, onSelect }) => {
    return (
        <div className="plan-item">
            <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-price">
                    <span>{plan.price} {plan.currency}</span>
                    <small>/ {plan.duration} jours</small>
                </div>
            </div>

            <ul className="plan-features">
                {Object.entries(plan.features).map(([key, value]) =>
                    value ? (
                        <li key={key}>
                            <CheckCircle size={16} />
                            <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                        </li>
                    ) : null
                )}
            </ul>

            <button className="select-plan-btn" onClick={() => onSelect(plan)}>
                Choisir ce plan
            </button>
        </div>
    );
};

export default function Pricing() {
    const { currentUser } = useAuth();
    const navigate = useNavigate() ;
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const res = await planService.getPlans();
            if (res.success) {
                setPlans(res.data);
                setLoading(false);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <Loading />

    const handleSelectPlan = (plan) => {
        // Vérifier si l'utilisateur est connecté
        if (!currentUser) {
            navigate('/auth/signin?continue=/plans');
            return;
        }

        setLoading(true);
        const planId = plan.id;
        setSelectedPlan(planId);

        subscriptionPlanStorage.set(plan); // Sauvegarder le plan complet

        console.log(`Plan selected: ${planId} - ${plan.slug}`);

        if (planId) {
            navigate(`/stores/create?plan=${plan.slug}`, { replace: true });
            setLoading(false);
        }
    }

    return (
        <div className="plans-grid">
            {plans.map((plan) => (
                <PriceItem
                    key={plan.id}
                    plan={plan}
                    onSelect={(plan) => handleSelectPlan(plan)}
                />
            ))}
        </div>
    );
};
