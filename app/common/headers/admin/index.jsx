import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logos } from "../../../config";
import Logo from "../../../components/ui/Logo";
import '../../../styles/headers/AdminHeader.scss';

export const AdminHeader = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const [notifications] = useState([
        {
            id: '1',
            title: 'Nouvelle connexion détectée',
            message: 'Une nouvelle connexion a été détectée sur votre compte depuis un appareil inconnu.',
            type: 'security',
            date: '2025-06-02T10:30:00Z',
            read: false,
        },
        {
            id: '2',
            title: 'Mot de passe modifié',
            message: 'Votre mot de passe a été modifié avec succès.',
            type: 'success',
            date: '2025-05-28T15:45:00Z',
            read: true,
        }
    ]);

    return (
        <div className="admin-header">
            <div className="logo-section">
                <button className="menu-button" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="logo-title">
                    <Logo src={logos.letterBlueBgWhite} alt="Logo" size="md" onclick={() => navigate('/')} />
                    <h1 className="title">Admin</h1>
                </div>
            </div>
            <div className="notification-section">
                <div className="notification-button">
                    <button>
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="notification-count">
                                {notifications.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}