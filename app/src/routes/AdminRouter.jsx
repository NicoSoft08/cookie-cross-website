import { Route, Routes } from 'react-router-dom';
import Admin from '../pages/private/admin/Admin';
import UsersList from '../pages/private/admin/UsersList';
import StoresList from '../pages/private/admin/StoresList';
import PostsList from '../pages/private/admin/PostsList';

export default function AdminRouter() {
    return (
        <Routes>
            <Route index element={<Admin />} />
            <Route path="/stores" element={<StoresList />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/posts" element={<PostsList />} />
        </Routes>
    );
};
