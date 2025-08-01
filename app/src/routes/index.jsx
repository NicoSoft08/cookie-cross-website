import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { AccountLayout } from "../layouts/account-layout";
import { AdminLayout } from "../layouts/admin-layout";
import { AppLayout } from "../layouts/app-layout";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { HelpLayout } from "../layouts/help-layout";
import { PayLayout } from "../layouts/pay-layout";
import AuthLayout from "../layouts/auth-layout";

// Routes
import AccountRouter from "./AccountRouter";
import AdminRouter from "./AdminRouter";
import AuthRouter from "./AuthRouter";
import DashboardRouter from "./DashboardRouter";
import HelpRouter from "./HelpRouter";

// Pages
import Category from "../pages/public/Category";
import NotFound from "../pages/public/NotFound";
import Home from "../pages/public/Home";
import Account from "../pages/private/account/Account";
import Admin from "../pages/private/admin/Admin";
import Dashboard from "../pages/private/dashboard/Dashboard";
import Stores from "../pages/public/Stores";
import StoreID from "../pages/public/StoreID";
import ListingDetails from "../pages/public/ListingDetails";
import Checkout from "../pages/pay/Checkout";
import SearchResults from "../pages/public/SearchResults";
import { LegalLayout } from "../layouts/legal-layout";
import LegalRouter from "./LegalRouter";
import PayProcess from "../pages/pay/PayProcess";
import Pricing from "../pages/public/Pricing";
import PhotoPack from "../pages/public/PhotoPack";

export const AppRouter = () => {
    return (
        <Router>
            <Routes>
                {/* Routes publiques avec AppLayout */}
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path='category/:slug' element={<Category />} />
                    <Route path='category/:slug/:subCategoryName/listing/:title' element={<ListingDetails />} />

                    <Route path="/pricing" element={<Pricing />} />

                    <Route path="stores" element={<Stores />} />
                    <Route path="/stores/:slug" element={<StoreID />} />
                    <Route path="/stores/create" element={<Stores />} />

                    <Route path='/listings/search' element={<SearchResults />} />

                    <Route path="/photo-pack" element={<PhotoPack />} />

                    {/* Autres routes publiques peuvent être ajoutées ici */}
                </Route>

                <Route path="/pay/*" element={<PayLayout />}>
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="process" element={<PayProcess />} />
                </Route>

                {/* Routes d'authentification (sans layout principal) */}
                <Route path="/auth/*" element={<AuthLayout />} >
                    <Route index element={<Navigate to="signin" replace />} />
                    <Route path="*" element={<AuthRouter />} />
                </Route>

                {/* Routes d'aide */}
                <Route path="/help/*" element={<HelpLayout />}>
                    <Route index element={<Navigate to="quick-access" replace />} />
                    <Route path="*" element={<HelpRouter />} />
                </Route>

                 {/* Routes  */}
                <Route path="/legal/*" element={<LegalLayout />}>
                    <Route index element={<Navigate to="quick-access" replace />} />
                    <Route path="*" element={<LegalRouter />} />
                </Route>

                {/* Routes d'administration avec layout spécifique */}
                <Route path="/admin/*" element={<AdminLayout />}>
                    <Route index element={<Admin />} />
                    <Route path="*" element={<AdminRouter />} />
                </Route>

                {/* Routes de compte avec AccountLayout */}
                <Route path="/account/*" element={<AccountLayout />}>
                    <Route index element={<Account />} />
                    <Route path="*" element={<AccountRouter />} />
                </Route>

                {/* Routes du dashboard */}
                <Route path="/dashboard/*" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="*" element={<DashboardRouter />} />
                </Route>

                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};