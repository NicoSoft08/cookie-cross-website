import { useEffect, useState } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card";
import { useAuth } from "../../../contexts/AuthContext";
import { userService } from "../../../services/users";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import '../../../styles/account/EmailAddresses.scss';

export default function EmailAddresses() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        document.title = 'Adresses e-mail';
    }, []);


    useEffect(() => {
        async function fetchData() {
            // Fetch data from the API
            const res = await userService.getUserEmails(
                currentUser.id,
                localStorage.getItem('accessToken')
            );

            if (res.success) {
                setEmails(res.data);
            }
        }

        if (currentUser) {
            fetchData();
        }

    }, [currentUser]);

    const primaryEmail = emails.find(e => e.type === 'PRIMARY') || { email: currentUser?.email };
    const recoveryEmail = emails.find(e => e.type === 'RECOVERY');
    const secondaryEmails = emails.filter(e => e.type === 'SECONDARY');

    return (
        <div className="email-addresses">
            <div className="page-header">
                <div className="back" onClick={() => navigate('/account/security')}>
                    <ChevronLeft size={24} />
                </div>
                <h2>Adresses e-mail</h2>
            </div>
            <p className="description">
                Gérez les e-mails associés à votre compte AdsCity. Ces adresses permettent de vous connecter,
                de recevoir des alertes de sécurité et de récupérer l’accès à votre compte.
            </p>

            <div className="email-cards">
                <Card className="email-card">
                    <CardHeader>
                        <CardTitle className="card-title">Adresse e-mail du compte AdsCity</CardTitle>
                        <CardDescription className="card-description">
                            Adresse principale non modifiable qui identifie votre compte AdsCity.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <p className="email">{primaryEmail.email}</p>
                    </CardFooter>
                </Card>

                <Card className="email-card">
                    <CardHeader>
                        <CardTitle className="card-title">Adresse e-mail de récupération</CardTitle>
                        <CardDescription className="card-description">
                            Adresse utilisée pour récupérer l’accès à votre compte ou recevoir des alertes importantes.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        {recoveryEmail ? (
                            <p className="email">{recoveryEmail.email}</p>
                        ) : (
                            <Link to={`/auth/verify-identity?action=recovery-email`}
                                className="btn-link recovery"
                            >
                                Ajouter une adresse e-mail de récupération
                            </Link>
                        )}
                    </CardFooter>
                </Card>

                <Card className="email-card">
                    <CardHeader>
                        <CardTitle className="card-title">Adresse e-mail de contact</CardTitle>
                        <CardDescription className="card-description">
                            Adresse à laquelle vous recevez des informations sur la plupart des produits AdsCity que vous utilisez avec ce compte.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <p className="email">{primaryEmail.email}</p>
                    </CardFooter>
                </Card>

                <Card className="email-card">
                    <CardHeader>
                        <CardTitle className="card-title">Adresses e-mail secondaires</CardTitle>
                        <CardDescription className="card-description">
                            Autres adresses utilisables pour la connexion et les notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="secondary-list">
                        {secondaryEmails.length > 0 ? (
                            <ul>
                                {secondaryEmails.map(email => (
                                    <li key={email.id} className="email">{email.email}</li>
                                ))}
                            </ul>
                        ) : (
                            <button className="btn-link">Ajouter une adresse e-mail secondaire</button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
