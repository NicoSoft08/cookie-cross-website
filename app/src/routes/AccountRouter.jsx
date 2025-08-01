import { Route, Routes } from 'react-router-dom';
import Account from '../pages/private/account/Account';
import Settings from '../pages/private/account/Settings';
import Profile from '../pages/private/account/Profile';
import Help from '../pages/private/account/Help';
import Security from '../pages/private/account/Security';
import DeviceActivity from '../pages/private/account/DeviceActivity';
import MyActivity from '../pages/private/account/MyActivity';
import EmailAddresses from '../pages/private/account/EmailAddresses';
import AddEmailAddress from '../pages/private/account/AddEmailAddress';
import PersoInfo from '../pages/private/account/PersoInfo';
import PhoneNumber from '../pages/private/account/PhoneNumber';
import Addresses from '../pages/private/account/Addresses';

export default function AccountRouter() {
    return (
        <Routes>
            <Route index element={<Account />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/personal-info" element={<PersoInfo />} />
            <Route path="/profile/personal-info/phone-number" element={<PhoneNumber />} />
            <Route path='/profile/device-activity' element={<DeviceActivity />} />
            <Route path='/profile/my-activity' element={<MyActivity />} />
            <Route path="/settings" element={<Settings />} />
             <Route path="/settings/addresses" element={<Addresses />} />
            <Route path="/security" element={<Security />} />
            <Route path="/security/email-addresses" element={<EmailAddresses />} />
            <Route path="/security/email-addresses/add" element={<AddEmailAddress />} />
            <Route path="/orders" element={<div>Orders</div>} />
            <Route path="/help" element={<Help />} />
        </Routes>
    );
};
