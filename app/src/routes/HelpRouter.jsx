import { Route, Routes } from 'react-router-dom';
import QuickAccess from '../pages/public/help/QuickAccess';

export default function HelpRouter() {
    return (
        <Routes>
            <Route path="/quick-access" element={<QuickAccess />} />
            <Route path="/contact" element={<div>Contact</div>} />
            <Route path="/faq" element={<div>Faqs</div>} />
        </Routes>
    );
};
