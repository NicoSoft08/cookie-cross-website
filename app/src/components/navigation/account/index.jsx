import { ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../../ui/Avatar";
import { navItems } from "../../../config";
import '../../../styles/navigation/AccountSidebar.scss';

export const AccountSidebar = ({ isOpen, closeSidebar, currentUser }) => {
    const location = window.location.pathname;
    const name = `${currentUser?.firstName} ${currentUser?.lastName}`;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div className="overlay" onClick={closeSidebar} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    {/* LOGO */}
                    <div className="logo-section">
                        <div className="logo">AdsCity</div>
                        <button className="close-button" onClick={closeSidebar}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* NAV ITEMS */}
                    <nav className="nav">
                        {navItems(currentUser?.role).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                className={`nav-link ${location === item.path ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                                {(item.label === 'Boutique' || item.label === 'Tableau de bord') && (
                                    <ExternalLink className="external-link" size={16} />
                                )}
                            </Link>
                        ))}
                    </nav>



                    {/* USER INFO */}
                    <div className="user-info">
                        <div className="user-details">
                            {/* AVATAR */}
                            <Avatar name={name} size="md" />
                            <div className="user-text">
                                <p className="user-name">{name}</p>
                                <p className="user-email" title={currentUser?.email}>{currentUser?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};