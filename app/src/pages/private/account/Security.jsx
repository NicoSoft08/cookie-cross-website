import { CheckCircle, Key, Smartphone, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import '../../../styles/account/Security.scss';

export default function Security() {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handleSubmit = async () => { }

    return (
        <div className="account-security">
            {/* Password section */}
            <Card>
                <CardHeader>
                    <CardTitle className='two-factor__header'>
                        <Key size={18} />
                        Mot de passe
                    </CardTitle>
                    <CardDescription>
                        Sécurisez votre compte avec un mot de passe fort.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showChangePassword ? (
                        <div className="change-password__status">
                            <p>Dernière mise à jour: il y a 3 mois</p>
                            <Button
                                onClick={() => setShowChangePassword(true)}
                                variant="outline"
                            >
                                Changer
                            </Button>
                        </div>
                    ) : (
                        <form className="change-password__form" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="current-password">Actuel mot de passe</label>
                                <input type="password" id="current-password" autoComplete="current-password" />
                            </div>

                            <div>
                                <label htmlFor="new-password">Nouveau mot de passe</label>
                                <input type="password" id="new-password" autoComplete="new-password" />
                            </div>

                            <div>
                                <label htmlFor="confirm-password">Confirmez le nouveau mot de passe</label>
                                <input type="password" id="confirm-password" autoComplete="new-password" />
                            </div>

                            <div className="change-password__form-actions">
                                <Button type="submit">Enregistrer</Button>
                                <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Two-factor authentication */}
            <Card>
                <CardHeader>
                    <CardTitle className="two-factor__header">
                        <Smartphone size={18} />
                        Authentification à deux facteurs
                    </CardTitle>
                    <CardDescription>
                        Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="two-factor__status-container">
                        <div className="two-factor__status">
                            <div className="two-factor__status-icon">
                                {twoFactorEnabled ? (
                                    <CheckCircle className="enabled" />
                                ) : (
                                    <XCircle className="disabled" />
                                )}
                            </div>
                            <div className="two-factor__status-text">
                                <p>{twoFactorEnabled ? 'Activé' : 'Désactivé'}</p>
                                <p>
                                    {twoFactorEnabled
                                        ? 'Votre compte est sécurisé avec l\'authentification à deux facteurs.'
                                        : 'Activez l\'authentification à deux facteurs pour une sécurité accrue.'
                                    }
                                </p>
                            </div>
                        </div>

                        <Button
                            variant={twoFactorEnabled ? 'outline' : 'primary'}
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        >
                            {twoFactorEnabled ? 'Désactiver' : 'Activer'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
