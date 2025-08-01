import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/private/dashboard/Dashboard';
import CreatePostPage from '../pages/private/dashboard/CreatePostPage';

export default function DashboardRouter() {
    return (
       <Routes>
            <Route index element={<Dashboard />} />
            <Route path="/posts/new" element={<CreatePostPage />} />
            <Route path="/settings" element={<div>Settings</div>} />
        </Routes>
    );
};
