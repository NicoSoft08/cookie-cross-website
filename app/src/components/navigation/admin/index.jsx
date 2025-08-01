import { ExternalLink, X } from "lucide-react"
import Avatar from "../../ui/Avatar"
import { Link } from "react-router-dom"
import { adminSidebarData } from "../../../config"
import { useAuth } from "../../../contexts/AuthContext"

export const AdminSidebar = ({ isOpen, closeSidebar }) => {
    const { currentUser } = useAuth();
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
                        {adminSidebarData.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                className={`nav-link ${location === item.path ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                                {(item.id === 'profile') && (
                                    <ExternalLink className='external-link' size={16} />
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
                                <p className="user-email">{currentUser?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}