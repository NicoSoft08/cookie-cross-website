import { Menu } from "lucide-react"
import Logo from "../../../components/ui/Logo"
import { logos } from "../../../config"
import '../../../styles/headers/AccountHeader.scss';
import { useNavigate } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";

export const AccountHeader = ({ toggleSidebar, currentUser }) => {
    const navigate = useNavigate();

    const name = `${currentUser?.firstName} ${currentUser?.lastName}`;

    return (
        <div className="account-header">
            <div className="logo-section">
                <button className="menu-button" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="logo-title">
                    <Logo src={logos.letterBlueBgWhite} alt="Logo" size="md" onclick={() => navigate('/')} />
                    <h1 className="title">Account</h1>
                </div>
            </div>
            <Avatar name={name} size="sm" />
        </div>
    )
}