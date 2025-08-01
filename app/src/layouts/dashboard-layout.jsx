import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "../components/navigation/dashboard";
import { DashboardHeader } from "../common/headers/dashboard";
import { useAuth } from "../contexts/AuthContext";
import '../styles/layouts/DashboardLayout.scss';

export const DashboardLayout = () => {
    const { currentUser } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            window.location.href = '/auth/signin';
            return;
        }

        if (currentUser && currentUser.role !== 'USER') {
            window.location.href = '/not-authorized';
            return;
        }
    }, [currentUser]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="dashboard-layout">
            <DashboardSidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

            <div className="layout-content">
                <DashboardHeader currentUser={currentUser} toggleSidebar={toggleSidebar} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}