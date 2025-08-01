import { Search } from "lucide-react";

// ListHeader.jsx
export default function StoreListHeader({
    itemsPerPage, setItemsPerPage, searchItem,
    setCurrentPage, handleChange, handleStatusChange,
    handleStateChange
}) {
    return (
        <div className="list-header">
            <select
                className="list-select"
                value={itemsPerPage}
                onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                }}
            >
                {[10, 25, 50, 100].map(n => (
                    <option key={n} value={n}>Afficher {n}</option>
                ))}
            </select>

            <div className="list-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Rechercher une boutique..."
                    className="list-input"
                    value={searchItem}
                    onChange={handleChange}
                />
            </div>

            <select
                className="list-select"
                onChange={handleStatusChange}
                defaultValue="all"
            >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
            </select>

            <select
                className="list-select"
                onChange={handleStateChange}
                defaultValue="all"
            >
                <option value="all">Tous les états</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvé</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="BANNED">Banni</option>
            </select>
        </div>
    );
}
