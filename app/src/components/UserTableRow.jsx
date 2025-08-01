import { Ban, EllipsisVertical, Eye, Pause, PenBox, Trash2 } from "lucide-react";
import { formattedDate } from "../utils";
import Avatar from "./ui/Avatar";
import Menu from "./ui/Menu";
import { useState } from "react";

export default function UserTableRow({
    item, selectedUserId, handleSelectUser, searchItem,
    onAction,
}) {
    const [openMenuId, setOpenMenuId] = useState(null);

    // Gère les modaux et actions liées à ce store uniquement
    const actions = [
        { label: 'Voir', action: 'view', icon: <Eye size={18} /> },
        { label: 'Bannir', action: 'ban', icon: <Ban size={16} /> },
        { label: 'Suspendre', action: 'suspend', icon: <Pause size={16} /> },
        { label: 'Modifier', action: 'edit', icon: <PenBox size={16} /> },
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

    return (
        <tr key={item.id}>
            <td>
                <input
                    type="checkbox"
                    checked={selectedUserId === item.id}
                    onChange={() => handleSelectUser(item.id)}
                />
            </td>
            <td>{formattedDate(item.createdAt)}</td>
            <td>
                <div className="users-name">
                    <Avatar src={item.avatar} name={`${item.firstName} ${item.lastName}`} size="sm" />
                    <span>{highlightMatch(`${item.firstName} ${item.lastName}`, searchItem)}</span>
                </div>
            </td>
            <td>{highlightMatch(item.email, searchItem)}</td>
            <td>
                <span className={`users-status ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td className="users-actions">
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
    )
}