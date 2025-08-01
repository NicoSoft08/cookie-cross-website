import { Outlet } from "react-router-dom";
import { HelpHeader } from "../common/headers/help";

export const HelpLayout = () => {
    return (
        <div>
            <HelpHeader />
            <Outlet />
        </div>
    );
};