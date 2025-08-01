import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// layouts
import AuthLayout from './layouts/auth';

// pages
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route index element={<Signin />} />
                    <Route path='/signup' element={<Signup />} />
                </Route>
            </Routes>
        </Router>
    );
};
