import { Outlet } from "react-router-dom"
import { AppHeader } from "../common/headers/app"
import { AppFooter } from "../common/footers/app"

export const AppLayout = () => {
    return (
        <div>
            <AppHeader />
            <Outlet />
            <AppFooter />
        </div>
    )
}