import { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin';
import Pagination from '../../../components/Pagination';
import '../../../styles/admin/StoresList.scss';
import Modal from '../../../components/ui/Modal';
import StoreDetails from './StoreDetails';
import { useAuth } from '../../../contexts/AuthContext';
import Spinner from '../../../components/ui/Spinner';
import StoreTableRow from '../../../components/StoreTableRow';
import StoreListHeader from '../../../components/StoreListHeader';

export default function StoresList() {
    const { currentUser } = useAuth();
    const [stores, setStores] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [searchItem, setSearchItem] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState({
        ban: false,
        delete: false,
        view: false,
    });

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await adminService.getStores(localStorage.getItem('accessToken'));
                setStores(res.data);
                setAllStores(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des magasins", error);
            }
        };
        fetchStores();
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchItem(value);

        if (value.trim() === '') {
            setStores(allStores);
        } else {
            const filtered = allStores.filter(store =>
                store.name.toLowerCase().includes(value.toLowerCase()) ||
                store.category.toLowerCase().includes(value.toLowerCase()) ||
                store.email.toLowerCase().includes(value.toLowerCase())
            );
            setStores(filtered);
            setCurrentPage(1);
        }
    };

    const handleStatusChange = (e) => {
        const status = e.target.value;
        if (status === 'active') {
            setStores(allStores.filter(store => store.isActive));
        } else if (status === 'inactive') {
            setStores(allStores.filter(store => !store.isActive));
        } else {
            setStores(allStores);
        }
        setCurrentPage(1);
    };

    const handleStateChange = (e) => {
        const status = e.target.value;
        if (status === 'PENDING') {
            setStores(allStores.filter(store => store.status === status));
        } else if (status === 'APPROVED') {
            setStores(allStores.filter(store => store.status === status));
        } else if (status === 'SUSPENDED') {
            setStores(allStores.filter(store => store.status === status));
        } else if (status === 'BANNED') {
            setStores(allStores.filter(store => store.status === status));
        } else {
            setStores(allStores)
        }
        setCurrentPage(1);
    };

    const handleSelectStore = (id) => {
        if (selectedStoreId === id) {
            setSelectedStoreId(null); // déselectionner si déjà sélectionné
        } else {
            setSelectedStoreId(id);
        }
    };

    const handleViewStore = (id) => {
        setOpenModal({ ...openModal, view: true });
        setSelectedStoreId(id);
        setOpenMenu(false);
    }
    const handleDeleteStore = async (id) => {
        setOpenModal({ ...openModal, delete: true });
        setSelectedStoreId(id);
        setOpenMenu(false);
    };

    const handleBanStore = async (id) => {
        setOpenModal({ ...openModal, ban: true });
        setSelectedStoreId(id);
        setOpenMenu(false);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStores = stores.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(stores.length / itemsPerPage);

    const handleStoreStatusChange = async (id, status) => {}


    const handleAction = async (action, id) => {
        switch (action) {
            case 'view':
                // Call API to view the store
                handleViewStore(id);
                setOpenMenu(false);
                break;
            case 'ban':
                // Call API to ban the store
                handleBanStore(id);
                setOpenMenu(false);
                break;
            case 'suspend':
                // Call API to suspend the store
                break;
            case 'approve':
                // Call API to approve the store
                break;
            case 'delete':
                // Call API to delete the store
                handleDeleteStore(id);
                setOpenMenu(false);
                break;
            default:
                break;
        }
    };

    return (
        <div className='stores-card'>
            <div className="stores-list">
                <StoreListHeader
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    searchItem={searchItem}
                    setCurrentPage={setCurrentPage}
                    handleChange={handleChange}
                    handleStatusChange={handleStatusChange}
                    handleStateChange={handleStateChange}
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
                                <th>Date de création</th>
                                <th>Nom</th>
                                <th>Status</th>
                                <th>Etat</th>
                                <th>Propriétaire</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStores.length > 0 ? (
                                currentStores.map(store => (
                                    <>
                                        <StoreTableRow
                                            key={store.id}
                                            item={store}
                                            isSelected={selectedStoreId === store.id}
                                            onSelect={handleSelectStore}
                                            onAction={handleAction}
                                            searchItem={searchItem}
                                        />

                                        {openModal.view && (
                                            <Modal
                                                isOpen={openModal.view}
                                                onClose={() => setOpenModal({ view: false })}
                                                title={"Détails de la boutique"}

                                                children={(
                                                    <StoreDetails
                                                        store={store}
                                                        currentUserId={currentUser.id}
                                                    />
                                                )}
                                            >
                                            </Modal>
                                        )}

                                        {openModal.ban && (
                                            <Modal
                                                isOpen={openModal.ban}
                                                onClose={() => setOpenModal({ ban: false })}
                                                title={`Bannir la boutique - ${store.name}`}

                                                footerClassName='modal-footer'

                                                footer={(
                                                    <div className="form-navigation">
                                                        <button type="button" className="prev" onClick={() => setOpenModal({ ban: false })}>
                                                            Annuler
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="next"
                                                            onClick={() => handleStoreStatusChange(store.id, 'banned')}
                                                            aria-label="Bannir la laboutique"
                                                        >
                                                            {isLoading ? <Spinner color="white" size={'md'} variant="digital" /> : "Confirmer"}
                                                        </button>
                                                    </div>
                                                )}
                                            >
                                                <div >
                                                    <p className="modal-description">
                                                        Voulez-vous vraiment bannir la boutique <strong>{store.name}</strong> ? Cette action est irréversible.
                                                    </p>

                                                    <div className="form-group">
                                                        <label htmlFor="ban-reason" className="form-label">Motif de la bannissement</label>
                                                        <textarea id="ban-reason" className="modal-textarea" placeholder="Motif de la bannissement" />
                                                    </div>


                                                </div>
                                            </Modal>
                                        )}

                                        {openModal.delete && (
                                            <Modal
                                                isOpen={openModal.delete}
                                                onClose={() => setOpenModal({ delete: false })}
                                                // title={`${store.name} - ${store.category}`}
                                                title={"Confirmer la suppression"}

                                                children={
                                                    <p>Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.</p>
                                                }

                                                footerClassName='modal-footer'

                                                footer={(
                                                    <div className="form-navigation">
                                                        <button type="button" className="prev" onClick={() => setOpenModal({ delete: false })}>
                                                            Annuler
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="next"
                                                            onClick={() => handleDeleteStore(store.id)}
                                                            aria-label="Supprimer la laboutique"
                                                        >
                                                            {isLoading ? <Spinner color="white" size={'md'} variant="digital" /> : "Confirmer"}
                                                        </button>
                                                    </div>
                                                )}
                                            >

                                            </Modal>
                                        )}

                                    </>


                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="stores-list__no-result">Aucune boutique trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="list-footer">
                    <div>
                        De {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, stores.length)} / {stores.length}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

