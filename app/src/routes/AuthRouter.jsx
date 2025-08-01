import { Route, Routes } from 'react-router-dom';
import Signin from '../pages/auth/Signin';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import VerifyIdentity from '../pages/auth/VerifyIdentity';

export default function AuthRouter() {
    return (
        <Routes>
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-identity" element={<VerifyIdentity />} />
            {/* <Route path="/verify-account" element={<VerifyAccount />} /> */}
            <Route path='/forgot-password' element={<ForgotPassword />} />
        </Routes>
    );
};
