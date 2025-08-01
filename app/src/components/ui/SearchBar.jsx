import { useCallback, useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ui/SearchBar.scss';

export default function SearchBar({ currentUser }) {
    const [isTyping, setIsTyping] = useState(false);
    const [keywords, setKeywords] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Chargement des suggestions avec useCallback
    const fetchSuggestions = useCallback(async () => {
        if (!keywords.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/suggestions?q=${encodeURIComponent(keywords.trim())}`
            );
            const data = await res.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true); // Contrôle explicite de l'affichage
        } catch (err) {
            console.error('Erreur fetch suggestions :', err);
            setSuggestions([]);
        }
    }, [keywords]);

    useEffect(() => {
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [fetchSuggestions]); // Dépendance optimisée

    const handleInputChange = (e) => {
        const rawValue = e.target.value;

        // 1. Nettoyage XSS avec DOMPurify
        const cleanValue = DOMPurify.sanitize(rawValue, {
            ALLOWED_TAGS: [], // Aucune balise HTML autorisée
            ALLOWED_ATTR: [], // Aucun attribut autorisé
            KEEP_CONTENT: true // Conserve le texte mais supprime les balises
        });

        // 2. Suppression des espaces en début + gestion des espaces multiples
        const trimmedValue = cleanValue
            .trimStart()
            .replace(/\s\s+/g, ' '); // Remplace les espaces multiples par un seul espace

        setKeywords(trimmedValue);
        setIsTyping(!!trimmedValue);
    };

    const handleSelectSuggestion = (suggestion) => {
        console.log(suggestion)
        setKeywords(suggestion.name);
        setSuggestions([]);

        if (currentUser) {
            const location = currentUser?.city;

            // Redirige ou lance la recherche
            handleSearch({
                location: location,
                category: suggestion.category,
                subcategory: suggestion.subcategory || '',
            });
        } else {
            // Redirige ou lance la recherche
            handleSearch({
                category: suggestion.category,
                subcategory: suggestion.subcategory || '',
            });
        }

    };

    const handleSearch = ({ location = '', category = '', subcategory = '' } = {}) => {
        const params = new URLSearchParams();
        const q = keywords.trim();

        if (q) params.set('q', q);
        if (location) params.set('location', location);
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);

        // 💡 Naviguer même si q seul est présent
        if (params.toString()) {
            navigate(`/listings/search?${params.toString()}`);
            handleClearSearch();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setSuggestions([]);
        }, 200);
    };

    const handleClearSearch = () => {
        setKeywords('');
        setSuggestions([]);
        setIsTyping(false);
    };

    function highlightMatch(text, query) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text;

        return (
            <>
                {text.slice(0, index)}
                <strong>{text.slice(index, index + query.length)}</strong>
                {text.slice(index + query.length)}
            </>
        );
    }

    return (
        <div className='search-bar'>
            <div className="search-input-container">
                <input
                    type="text"
                    className='input-field'
                    placeholder='Recherchez une catégorie ou un produit...'
                    value={keywords}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    aria-label="Recherche"
                />
                {isTyping ? (
                    <X
                        size={24}
                        className='search-icon'
                        onClick={handleClearSearch}
                        aria-label="Effacer la recherche"
                    />
                ) : (
                    <Search
                        size={24}
                        className='search-icon'
                        onClick={() => handleSearch()}
                        aria-label="Lancer la recherche"
                    />
                )}
            </div>

            {isTyping && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((sugg) => (
                        <li
                            key={`${sugg.id}-${sugg.type}`}
                            onClick={() => handleSelectSuggestion(sugg)}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <img src={sugg.image} alt={sugg.name} className='suggestion-image' />
                            <span className="suggestion-name">
                                {sugg.displayCategory
                                    ? <>
                                        {highlightMatch(sugg.displayCategory, keywords)} ➝ {highlightMatch(sugg.name, keywords)}
                                    </>
                                    : highlightMatch(sugg.name, keywords)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
