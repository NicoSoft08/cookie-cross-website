import { Ban, CheckCircle, EllipsisVertical, Eye, Pause, Trash2 } from "lucide-react";
import { formattedDate } from "../utils";
import Avatar from "./ui/Avatar";
import Menu from "./ui/Menu";
import { useState } from "react";

// TableRow.jsx
export default function StoreTableRow({
    item, isSelected, onSelect, onAction,
    searchItem
}) {
    const [openMenuId, setOpenMenuId] = useState(null);

    // Gère les modaux et actions liées à ce store uniquement
    const actions = [
        { label: 'Voir', action: 'view', icon: <Eye size={18} /> },
        { label: 'Bannir', action: 'ban', icon: <Ban size={16} /> },
        { label: 'Suspendre', action: 'suspend', icon: <Pause size={16} /> },
        { label: 'Approuver', action: 'approve', icon: <CheckCircle size={16} /> },
        { label: 'Supprimer', action: 'delete', icon: <Trash2 size={16} /> }
    ];


    function highlightMatch(text, query) {
        const index = text?.toLowerCase().indexOf(query?.toLowerCase());
        if (index === -1) return text;

        return (
            <>
                {text.slice(0, index)}
                <strong>{text.slice(index, index + query.length)}</strong>
                {text.slice(index + query.length)}
            </>
        );
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'APPROVED':
                return 'Approuvée';
            case 'SUSPENDED':
                return 'Suspendue';
            case 'BANNED':
                return 'Bannie';
            default:
                return 'Inconnu';
        }
    };

    return (
        <tr key={item.id}>
            <td>
                <input
                    type="checkbox"
                    checked={isSelected === item.id}
                    onChange={() => onSelect(item.id)}
                />
            </td>
            <td>{formattedDate(item.createdAt)}</td>
            <td>
                <div className="stores-name">
                    <Avatar src={item.avatar} name={item.name} size="sm" />
                    <span>{highlightMatch(item.name, searchItem)}</span>
                </div>
            </td>
            <td>
                <span className={`stores-status ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td>
                <span className={`stores-state ${item.status.toLowerCase()}`}>
                    {getStatusLabel(item.status)}
                </span>
            </td>
            <td>
                <div className="stores-name">
                    <Avatar src={item.owner?.avatar} name={`${item.owner?.firstName} ${item.owner?.lastName}`} size="sm" />
                    <span>{highlightMatch(`${item.owner?.firstName} ${item.owner?.lastName}`, searchItem)}</span>
                </div>
            </td>
            <td className="stores-actions">
                <button onClick={() => setOpenMenuId(prev => (prev === item.id ? null : item.id))} title="Actions">
                    <EllipsisVertical size={16} />
                </button>
                {openMenuId === item.id && (
                    <Menu
                        isOpen={true}
                        onClose={() => setOpenMenuId(null)}
                        onAction={(action) => {
                            onAction(action, item.id);
                            console.log(`Action: ${action} sur la boutique ${item.id}`);
                            setOpenMenuId(null);
                        }}
                        options={actions}
                    />
                )}
            </td>
        </tr>
    );
}
