import { Outlet } from "react-router-dom"

export const PayLayout = () => {
    return (
        <div>
            {/* Ici, vous pouvez ajouter un en-tête ou un pied de page spécifique au paiement si nécessaire */}
            <Outlet />
        </div>
    )
}