import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import Loading from '../../components/ui/Loading';
import '../../styles/public/SearchResults.scss';
import { AlertCircle, Grid3X3, List, Package, SortDesc } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import PostCard from '../../components/posts/PostCard';
import PostsList from '../../components/posts/PostsList';

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setFilters({
            q: searchParams.get('q'),
            category: searchParams.get('category') || '',
            subcategory: searchParams.get('subcategory') || '',
            sortBy: searchParams.get('sortBy') || 'relevance'
        });
    }, [searchParams]);

    // Filtres depuis l'URL
    const [filters, setFilters] = useState({
        q: searchParams.get('q'),
        category: searchParams.get('category') || '',
        subcategory: searchParams.get('subcategory') || '',
        sortBy: searchParams.get('sortBy') || 'relevance'
    });

    console.log('Query:', q);
    console.log('Filters:', filters);

    useEffect(() => {
        if (filters.q) {
            setCurrentPage(1);
            loadResults(1);
        } else {
            setResults([]);
            setTotal(0);
        }
    }, [filters]);

    const loadResults = async (page = currentPage) => {
        try {
            setLoading(true);
            setError('');

            const searchFilters = {
                ...filters,
                page,
                limit: 20
            };

            console.log('Advanced Filters:', searchFilters);

            console.log('Calling API with:', { query: q, filters: searchFilters });

            const data = await apiService.getAdvancedSearch(searchFilters);

            console.log('API Response:', data);

            if (page === 1) {
                setResults(data.data || []);
            } else {
                setResults(prev => [...prev, ...(data.data || [])]);
            }

            setTotal(data.total || 0);
            setHasMore(data.hasMore || false);
            setCurrentPage(page);

        } catch (err) {
            console.error('Search error:', err);
            setError("Erreur lors de la recherche: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);

        // Mettre à jour l'URL
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            loadResults(currentPage + 1);
        }
    };

    if (loading) return <Loading />
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="search-results">
            <div className="search-header">
                <h1>Résultats pour "{q}"</h1>
                <span className="results-count">
                    {total.toLocaleString()} résultat{total > 1 ? 's' : ''}
                </span>
            </div>

            {/* Contrôles de tri */}
            <div className="results-controls">
                <div className="sort-control">
                    <SortDesc className="sort-icon" />
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                        className="sort-select"
                    >
                        <option value="relevance">Pertinence</option>
                        <option value="date_desc">Plus récent</option>
                        <option value="date_asc">Plus ancien</option>
                        <option value="price_asc">Prix croissant</option>
                        <option value="price_desc">Prix décroissant</option>
                    </select>
                </div>
            </div>

            {/* Résultats */}
            <div className="results-container">
                {loading && currentPage === 1 ? (
                    <Loading />
                ) : error ? (
                    <div className="error-state">
                        <AlertCircle className="error-icon" />
                        <h3>Erreur de recherche</h3>
                        <p>{error}</p>
                        <button onClick={() => loadResults(1)}>
                            Réessayer
                        </button>
                    </div>
                ) : results.length === 0 ? (
                    <div className="empty-state">
                        <Package className="empty-icon" />
                        <h3>Aucun résultat trouvé</h3>
                        <p>Aucune annonce ne correspond à votre recherche "{q}".</p>
                    </div>
                ) : (
                    <>
                        <PostsList>
                            {results.map((listing, index) => (
                                <PostCard
                                    key={`${listing.id}-${index}`}
                                    listing={listing}
                                />
                            ))}
                            {results.map((listing, index) => (
                                <PostCard
                                    key={`${listing.id}-${index}`}
                                    listing={listing}
                                />
                            ))}
                        </PostsList>
                        {hasMore && (
                            <div className="load-more-container">
                                <button
                                    className="load-more-button"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Spinner />
                                    ) : (
                                        'Charger plus de résultats'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Info pagination */}
                        <div className="pagination-info">
                            <span>
                                Affichage de {results.length} sur {total.toLocaleString()} résultats
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
