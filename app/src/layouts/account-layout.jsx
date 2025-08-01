import { Outlet } from "react-router-dom"
import { AccountHeader } from "../common/headers/account"
import { useEffect, useState } from "react";
import { AccountSidebar } from "../components/navigation/account";
import { useAuth } from "../contexts/AuthContext";
import '../styles/layouts/AccountLayout.scss';

export const AccountLayout = () => {
    const { currentUser } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            window.location.href = '/auth/signin';
        }
    }, [currentUser]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="account-layout">
            <AccountSidebar currentUser={currentUser} isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

            <div className="layout-content">
                <AccountHeader toggleSidebar={toggleSidebar} currentUser={currentUser} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}