import { Menu } from "lucide-react";
import Logo from "../../../components/ui/Logo";
import { logos } from "../../../config";
import Avatar from "../../../components/ui/Avatar";
import { useNavigate } from "react-router-dom";
import '../../../styles/headers/HelpHeader.scss';

export const HelpHeader = ({ toggleSidebar, currentUser }) => {
    const navigate = useNavigate();

    const name = `${currentUser?.firstName} ${currentUser?.lastName}`;

    const handleNavigate = async () => {
        if (!currentUser) {
            navigate('/auth/signin?continue=/account/quick-access');
            return;
        }

        if (!currentUser?.emailVerified) {
            navigate('/auth/verify-email?continue=/account/quick-access');
            return;
        }

        navigate('/account/quick-access');
    }

    return (
        <div className="help-header">
            <div className="logo-section">
                <button className="menu-button" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="logo-title">
                    <Logo src={logos.letterBlueBgWhite} alt="Logo" size="md" onclick={() => navigate('/')} />
                    <h1 className="title">Centre d'Aide</h1>
                </div>
            </div>
            <Avatar
                size="md"
                name={name}
                onclick={handleNavigate}
            />
        </div>
    )
};