import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/navigation/admin";
import { AdminHeader } from "../common/headers/admin";
import { useAuth } from "../contexts/AuthContext";
import '../styles/layouts/AdminLayout.scss';

export const AdminLayout = () => {
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
        <div className="admin-layout">
            <AdminSidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

            <div className="layout-content">
                <AdminHeader toggleSidebar={toggleSidebar} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};