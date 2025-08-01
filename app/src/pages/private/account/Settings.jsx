import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Bell, Eye, Globe, Save } from "lucide-react";
import Button from "../../../components/ui/Button";
import '../../../styles/account/Settings.scss';

export default function Settings() {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        preferredLanguage: currentUser?.preferredLanguage,
        emailNotifications: currentUser?.emailNotifications,
        smsNotifications: currentUser?.smsNotifications,
        isProfilePublic: currentUser?.isProfilePublic,
        showPhoneNumber: currentUser?.showPhoneNumber,
        pushNotifications: currentUser?.pushNotifications,
    });

    const handleToggleChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, would save to backend here
        alert('Settings saved successfully!');
    };

    return (
        <div className='settings'>
            <form onSubmit={handleSubmit} className="settings-form">
                {/* Language preferences */}
                <Card className="settings-card">
                    <CardHeader>
                        <CardTitle className="card-title-icon">
                            <Globe size={18} className="icon-title" />
                            Préférences linguistiques
                        </CardTitle>
                        <CardDescription>
                            Faites le choix de la langue que vous préférez utiliser pour votre expérience sur notre plateforme.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="form-group">
                            <label htmlFor="preferredLanguage" className="label">
                                Langue préférée
                            </label>
                            <select
                                id="preferredLanguage"
                                name="preferredLanguage"
                                value={formData.preferredLanguage}
                                onChange={handleSelectChange}
                                className="select-input"
                            >
                                <option value="en">Anglais</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification settings */}
                <Card className="settings-card">
                    <CardHeader>
                        <CardTitle className="card-title-icon">
                            <Bell size={18} className="icon-title" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Configurer quand et comment vous souhaitez recevoir des notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="toggle-group">
                            {[
                                {
                                    label: 'Notifications par e-mail',
                                    desc: 'Vous recevrez des notifications par e-mail.',
                                    name: 'emailNotifications',
                                    checked: formData.emailNotifications,
                                },
                                {
                                    label: 'Notifications par SMS',
                                    desc: 'Vous recevrez des notifications par SMS.',
                                    name: 'smsNotifications',
                                    checked: formData.smsNotifications,
                                },
                                {
                                    label: 'Notifications PUSH',
                                    desc: 'Vous recevrez des notifications sur votre navigateur.',
                                    name: 'pushNotifications',
                                    checked: formData.pushNotifications,
                                },
                            ].map((setting) => (
                                <div key={setting.name} className="toggle-item">
                                    <div>
                                        <p className="toggle-title">{setting.label}</p>
                                        <p className="toggle-desc">{setting.desc}</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            name={setting.name}
                                            checked={setting.checked}
                                            onChange={handleToggleChange}
                                            className="sr-only"
                                        />
                                        <div className="switch-slider"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy settings */}
                <Card className="settings-card">
                    <CardHeader>
                        <CardTitle className="card-title-icon">
                            <Eye size={18} className="icon-title" />
                            Vie privée
                        </CardTitle>
                        <CardDescription>
                            Controllez la visibilité de votre profil et le le partage de vos données personnelles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="toggle-group">
                            {[
                                {
                                    label: 'Profil public',
                                    desc: 'Permet aux autres utilisateurs de voir votre profil public.',
                                    name: 'isProfilePublic',
                                    checked: formData.isProfilePublic,
                                },
                                {
                                    label: 'Voir mon numéro de téléphone',
                                    desc: 'Permet aux autres utilisateurs de voir votre numéro de téléphone.',
                                    name: 'showPhoneNumber',
                                    checked: formData.showPhoneNumber,
                                },
                            ].map((privacy) => (
                                <div key={privacy.name} className="toggle-item">
                                    <div>
                                        <p className="toggle-title">{privacy.label}</p>
                                        <p className="toggle-desc">{privacy.desc}</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            name={privacy.name}
                                            checked={privacy.checked}
                                            onChange={handleToggleChange}
                                            className="sr-only"
                                        />
                                        <div className="switch-slider"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Danger zone */}
                <Card className="settings-card danger-zone">
                    <CardHeader>
                        <CardTitle className="text-danger">
                            Zone de danger
                        </CardTitle>
                        <CardDescription>
                            Attention, les actions suivantes sont irréversibles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="delete-box">
                            <h4 className="delete-title">Supprimer mon compte</h4>
                            <p className="delete-description">
                                Supprimer définitivement votre compte et toutes les données associées. Cette action est irréversible.
                            </p>
                            <div className="delete-action">
                                <Button variant="danger">Supprimer</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="form-footer">
                    <Button type="submit" icon={<Save size={16} />}>
                        Enregistrer les modifications
                    </Button>
                </div>
            </form>
        </div>
    );
};
