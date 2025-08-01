import { useEffect, useState } from "react";
import { adminService } from "../../../services/admin";
import UserListHeader from "../../../components/UserListHeader";
import UserTableRow from "../../../components/UserTableRow";
import '../../../styles/admin/UsersList.scss';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchItem, setSearchItem] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await adminService.getUsers(localStorage.getItem('accessToken'));
                setUsers(res.data);
                setAllUsers(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs", error);
            }
        };
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchItem(value);

        if (value.trim() === '') {
            setUsers(allUsers);
        } else {
            const filtered = allUsers.filter(user =>
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase()) ||
                user.email.toLowerCase().includes(value.toLowerCase())
            );
            setUsers(filtered);
            setCurrentPage(1);
        }
    };

    const handleStatusChange = (e) => {
        const status = e.target.value;
        if (status === 'active') {
            setUsers(allUsers.filter(user => user.isActive));
        } else if (status === 'inactive') {
            setUsers(allUsers.filter(user => !user.isActive));
        } else {
            setUsers(allUsers);
        }
        setCurrentPage(1);
    };

    const handleSelectUser = (id) => {
        if (selectedUserId === id) {
            setSelectedUserId(null); // déselectionner si déjà sélectionné
        } else {
            setSelectedUserId(id);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handleAction = async (action, id) => {
        switch (action) {
            case 'view':
                console.log('Voir');
                break;
            case 'ban':
                console.log('Bannir');
                break;
            case 'suspend':
                console.log('Suspendre');
                break;
            case 'edit':
                console.log('Modifier');
                break;
            case 'delete':
                console.log('Supprimer');
                break;
            default:
                break;
        }
    }

    return (
        <div className="users-card">
            <div className="users-list">
                <UserListHeader
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    searchItem={searchItem}
                    setCurrentPage={setCurrentPage}
                    handleChange={handleChange}
                    handleStatusChange={handleStatusChange}
                />

                <div className="list-table-container">
                    <table className="list-table">
                        <thead>
                            <tr>
                                {/* Checkbox maître (si tu veux ajouter une sélection globale plus tard) */}
                                <th>
                                    <input
                                        type="checkbox"
                                        disabled
                                        title="Sélection globale non implémentée"
                                    />
                                </th>
                                <th>Date d’inscription</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Etat</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map(user => (
                                    <>
                                        <UserTableRow
                                            key={user.id}
                                            item={user}
                                            selectedUserId={selectedUserId}
                                            handleSelectUser={handleSelectUser}
                                            searchItem={searchItem}
                                            onAction={handleAction}
                                        />
                                    </>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="users-list__no-result">Aucun utilisateur trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                <div className="list-footer">
                    <div>
                        De {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, users.length)} / {users.length}
                    </div>

                    <div className="list-pagination">
                        <button
                            className="users-list-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </button>

                        {[...Array(totalPages).keys()].map((page) => (
                            <button
                                key={page + 1}
                                onClick={() => setCurrentPage(page + 1)}
                                className={`users-list-btn ${currentPage === page + 1 ? 'active' : ''}`}
                            >
                                {page + 1}
                            </button>
                        ))}

                        <button
                            className="users-list-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
