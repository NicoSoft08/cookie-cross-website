import { useState } from "react";
import Avatar from "./ui/Avatar";
import { Ban, CheckCircle, EllipsisVertical, Eye, Pause, PenBox, Trash2 } from "lucide-react";
import Menu from "./ui/Menu";

export default function PostTableRow({
    item, selectedPostId, searchItem, category, subcategory,
    handleSelectPost, onAction
}) {
    const [openMenuId, setOpenMenuId] = useState(null);

    const actions = [
        { label: 'Voir', action: 'view', icon: <Eye size={18} /> },
        { label: 'Approuver', action: 'approve', icon: <CheckCircle size={16} /> },
        { label: 'Bannir', action: 'ban', icon: <Ban size={16} /> },
        { label: 'Suspendre', action: 'suspend', icon: <Pause size={16} /> },
        { label: 'Modifier', action: 'edit', icon: <PenBox size={16} /> },
        { label: 'Supprimer', action: 'delete', icon: <Trash2 size={16} /> }
    ];
 
    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'APPROVED':
                return 'Approuvée';
            case 'REJECTED':
                return 'Rejetée';
            case 'ACTIVE':
                return 'Active';
            case 'INACTIVE':
                return 'Inactif';
            case 'EXPIRED':
                return 'Expirée';
            case 'DELETED':
                return 'Supprimée';
            default:
                return 'Inconnu';
        }
    };

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
                    checked={selectedPostId === item.id}
                    onChange={() => handleSelectPost(item.id)}
                />
            </td>
            <td>
                <div className="stores-name">
                    <Avatar src={item.images[0].thumbnails?.original} name={item.details?.title} size="sm" />
                    <span>{highlightMatch(item.details?.title, searchItem)}</span>
                </div>
            </td>
            <td>
                {highlightMatch(category, searchItem)}
            </td>
            <td>
                {highlightMatch(subcategory, searchItem)}
            </td>
            <td>
                <span className={`stores-status ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td>
                <span className={`stores-state ${item.status?.toLowerCase()}`}>
                    {getStatusLabel(item.status)}
                </span>
            </td>
            <td>
                <div className="stores-name">
                    <Avatar src={item.store?.avatar} name={item.store?.name} size="sm" />
                    <span>{highlightMatch(item.store?.name, searchItem)}</span>
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
};
