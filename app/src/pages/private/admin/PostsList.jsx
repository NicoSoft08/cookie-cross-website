import { useEffect, useState } from "react";
import { postService } from "../../../services/posts";
import { categoryService } from "../../../services/categories";
import PostTableRow from "../../../components/PostTableRow";
import PostListHeader from "../../../components/PostListHeader";
import '../../../styles/admin/PostsList.scss';

export default function PostsList() {
    const [posts, setPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [searchItem, setSearchItem] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPostId, setSelectedUPostId] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await postService.getPosts(
                    localStorage.getItem('accessToken')
                );
                setPosts(res.data);
                setAllPosts(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs", error);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        loadCategoriesData();
    }, []);

    const loadCategoriesData = async () => {
        const res = await categoryService.getCategories();
        if (res.success) {
            setCategories(res.data?.categoriesData);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchItem(value);

        if (value.trim() === '') {
            setPosts(allPosts);
        } else {
            const filtered = allPosts.filter(user =>
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase()) ||
                user.email.toLowerCase().includes(value.toLowerCase())
            );
            setPosts(filtered);
            setCurrentPage(1);
        }
    };

    const handleStatusChange = (e) => {
        const status = e.target.value;
        if (status === 'active') {
            setPosts(allPosts.filter(store => store.isActive));
        } else if (status === 'inactive') {
            setPosts(allPosts.filter(store => !store.isActive));
        } else {
            setPosts(allPosts);
        }
        setCurrentPage(1);
    };

    const handleStateChange = (e) => {
        const status = e.target.value;
        if (status === 'PENDING') {
            setPosts(allPosts.filter(store => store.status === status));
        } else if (status === 'APPROVED') {
            setPosts(allPosts.filter(store => store.status === status));
        } else if (status === 'REJECTED') {
            setPosts(allPosts.filter(store => store.status === status));
        } else if (status === 'ACTIVE') {
            setPosts(allPosts.filter(store => store.isActive));
        } else if (status === 'INACTIVE') {
            setPosts(allPosts.filter(store => !store.isActive));
        } else if (status === 'EXPIRED') {
            setPosts(allPosts.filter(store => store.status === status));
        } else if (status === 'DELETED') {
            setPosts(allPosts.filter(store => store.status === status));
        } else {
            setPosts(allPosts)
        }
        setCurrentPage(1);
    };

    const handleSelectPost = (id) => {
        if (selectedPostId === id) {
            setSelectedUPostId(null); // déselectionner si déjà sélectionné
        } else {
            setSelectedUPostId(id);
        }
    };

    // Fonction pour formater les catégories et sous-catégories
    const formatCategorization = (post) => {
        let category = "";
        let subcategory = "";

        if (post.category) {
            const categoryData = categories.find(cat => cat.categoryName === post.category);
            if (categoryData) category = categoryData.categoryTitle;

            if (post.subcategory && categoryData?.subcategories) {
                const subcategoryData = categoryData.subcategories.find(subcat => subcat.sousCategoryName === post.subcategory);
                if (subcategoryData) subcategory = subcategoryData.sousCategoryTitle;
            }
        }

        return { category, subcategory };
    };

    const handleAction = async (action, id) => { }


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPosts = posts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(posts.length / itemsPerPage);

    return (
        <div className="posts-card">
            <div className="posts-list">
                <PostListHeader
                    searchItem={searchItem}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                    setItemsPerPage={setItemsPerPage}
                    handleChange={handleChange}
                    handleStateChange={handleStateChange}
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
                                <th>Poste</th>
                                <th>Catégorie</th>
                                <th>Sous catégorie</th>
                                <th>Status</th>
                                <th>Etat</th>
                                <th>Boutique</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentPosts.length > 0 ? (
                                currentPosts.map(post => {
                                    const { category, subcategory } = formatCategorization(post);

                                    return (
                                        <PostTableRow
                                            item={post}
                                            category={category}
                                            subcategory={subcategory}
                                            selectedPostId={selectedPostId}
                                            handleSelectPost={handleSelectPost}
                                            onAction={handleAction}
                                            searchItem={searchItem}
                                        />
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="stores-list__no-result">Aucune annonce trouvée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                <div className="list-footer">
                    <div>
                        De {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, posts.length)} / {posts.length}
                    </div>

                    <div className="list-pagination">
                        <button
                            className="stores-list-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </button>

                        {[...Array(totalPages).keys()].map((page) => (
                            <button
                                key={page + 1}
                                onClick={() => setCurrentPage(page + 1)}
                                className={`stores-list-btn ${currentPage === page + 1 ? 'active' : ''}`}
                            >
                                {page + 1}
                            </button>
                        ))}

                        <button
                            className="stores-list-btn"
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
};
