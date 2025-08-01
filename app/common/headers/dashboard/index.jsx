import { Bell, Menu } from "lucide-react"
import Logo from "../../../components/ui/Logo"
import { logos } from "../../../config"
import { useEffect, useState } from "react";
import '../../../styles/headers/DashboardHeader.scss';
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../../services/notifications";

export const DashboardHeader = ({ toggleSidebar, currentUser }) => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);

    const hasUserStore = currentUser && currentUser.storeId !== null;
    const userStoreName = hasUserStore ? currentUser.store?.name : 'Nom de votre boutique';


    useEffect(() => {
        const fetchNotifications = async () => {
            const res = await notificationService.getUserNotifications(
                currentUser?.id,
                localStorage.getItem('accessToken')
            );

            if (res.success) {
                setNotifications(res.data?.notifications ?? []);
            }
        };

        fetchNotifications();
    }, [currentUser]);

    return (
        <div className="dashboard-header">
            <div className="logo-section">
                <button className="menu-button" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="logo-title">
                    <Logo src={logos.letterBlueBgWhite} alt="Logo" size="md" onclick={() => navigate('/')} />
                    <h1 className="title">
                        {hasUserStore ? userStoreName : 'Dashboard'}
                    </h1>
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