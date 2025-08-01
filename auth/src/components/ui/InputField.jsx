import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import '../../styles/ui/InputField.scss';

const sanitizeInput = (value, fieldType, fieldName) => {
    // Ne pas sanitizer ces types de champs
    if (['password', 'file', 'email'].includes(fieldType) ||
        fieldName === 'email' ||
        fieldType === 'textarea') {
        return value;
    }

    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        RETURN_DOM: false,
        FORBID_ATTR: ['style', 'onerror', 'onload']
    });
};

export default function InputField({
    type,
    name,
    label,
    placeholder,
    options,
    multiple,
    required,
    validation,
    value,
    onChange,
    brands,
    errors,
    onBlur,
    readOnly
}) {
    const safeValue = value ?? (multiple ? [] : '');
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    const dropdownRef = useRef(null);

    // Fermer le dropdown quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mise à jour du terme de recherche quand la valeur change
    useEffect(() => {
        if (name === 'brand' && value && brands) {
            const selectedBrand = brands.find(b => b.value === value);
            if (selectedBrand) setSearchTerm(selectedBrand.label);
        }
    }, [value, name, brands]);

    // Validation locale
    const validate = (value) => {
        if (!validation) return true;

        if (required && !value) {
            return 'Ce champ est obligatoire';
        }

        if (validation.minLength && value.length < validation.minLength) {
            return `Minimum ${validation.minLength} caractères`;
        }

        if (validation.maxLength && value.length > validation.maxLength) {
            return `Maximum ${validation.maxLength} caractères`;
        }

        if (validation.min && value.length < validation.min) {
            return `Valeur minimum ${validation.min}`;
        }

        if (validation.max && value.length > validation.max) {
            return `Valeur maximum ${validation.max}`;
        }

        return null;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        // Sanitization ciblée
        if (type !== 'checkbox' && type !== 'file') {
            newValue = sanitizeInput(newValue, type, name);
        }

        // Propagation au parent
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: newValue,
                    type,
                    checked: type === 'checkbox' ? checked : undefined
                }
            });
        }

        // Validation en temps réel
        if (isTouched) {
            const error = validate(newValue);
            if (errors[name] !== error) {
                errors[name] = error;
            }
        }
    };

    const handleBlur = () => {
        setIsTouched(true);
        const error = validate(safeValue);
        if (errors[name] !== error) {
            errors[name] = error;
            if (onBlur) onBlur(name, error);
        }
    };

    const handleBrandSelect = (brand) => {
        onChange({ target: { name, value: brand.value } });
        setIsOpen(false);
    };

    function highlightMatch(text, query) {
        if (!query) return text;
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text;

        return (
            <>
                {text.slice(0, index)}
                <strong className="highlight">{text.slice(index, index + query.length)}</strong>
                {text.slice(index + query.length)}
            </>
        );
    }

    const renderField = () => {
        switch (type) {
            case 'text':
            case 'number':
            case 'email':
            case 'password':
            case 'country':
            case 'city':
            case 'address':
            case 'year':
                return (
                    <>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            placeholder={placeholder}
                            required={required}
                            value={safeValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors[name] ? 'error' : ''}
                            readOnly={readOnly}
                        />
                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </>
                )

            case 'textarea':
                return (
                    <>
                        <textarea
                            id={name}
                            name={name}
                            placeholder={placeholder}
                            required={required}
                            value={safeValue}
                            onChange={onChange}
                            className={errors[name] ? 'error' : ''}
                            rows="5"
                        />
                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </>
                );

            case 'date':
            case 'time':
                return (
                    <>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            required={required}
                            value={safeValue}
                            onChange={onChange}
                            className={errors[name] ? 'error' : ''}
                        />
                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </>
                );

            case 'select':
                const opts = name === 'brand' ? brands : options;
                if (name === 'brand') {
                    const filteredBrands = searchTerm.length > 1
                        ? opts?.filter(brand =>
                            brand.label.toLowerCase().startsWith(
                                sanitizeInput(searchTerm, 'text', 'brandSearch').toLowerCase()
                            )
                        ) || []
                        : [];

                    return (
                        <div className="brand-search-wrapper" ref={dropdownRef}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsOpen(true);
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder={placeholder || "Rechercher une marque..."}
                                className="brand-search-input"
                                autoComplete="off"
                                
                            />

                            {isOpen && (
                                <div className="brand-dropdown">
                                    {searchTerm.length <= 1 ? (
                                        <div className="search-hint">
                                            Saisissez au moins 2 caractères
                                        </div>
                                    ) : filteredBrands.length > 0 ? (
                                        filteredBrands.map((brand) => (
                                            <div
                                                key={brand.value}
                                                className={`brand-option ${value === brand.value ? 'selected' : ''}`}
                                                onClick={() => handleBrandSelect(brand)}
                                            >
                                                {brand.icon && (
                                                    <img
                                                        src={brand.icon}
                                                        alt={brand.label}
                                                        className="brand-icon"
                                                        crossOrigin="anonymous"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <span className="brand-label">
                                                    {highlightMatch(brand.label, searchTerm)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-results">Aucun résultat trouvé</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <>
                        <select
                            id={name}
                            name={name}
                            value={safeValue}
                            required={required}
                            multiple={multiple}
                            onChange={onChange}
                            className={errors[name] ? 'error' : ''}
                        >
                            {!multiple && <option value="">{placeholder || "Sélectionner"}</option>}
                            {options?.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </>
                );

            case 'radio':
                return (
                    <div className="radio-group">
                        {options?.map((option, index) => (
                            <label key={index} className="radio-label">
                                <input
                                    type="radio"
                                    name={name}
                                    value={option}
                                    checked={safeValue === option}
                                    required={required}
                                    onChange={onChange}
                                    className={errors[name] ? 'error' : ''}
                                />
                                <span className="radio-custom"></span>
                                {option}
                            </label>
                        ))}

                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="checkbox-group">
                        {options?.map((option, index) => (
                            <label key={index} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name={name}
                                    value={option}
                                    checked={Array.isArray(safeValue) ? safeValue.includes(option) : false}
                                    required={required}
                                    onChange={onChange}
                                    className={errors[name] ? 'error' : ''}
                                />
                                <span className="checkbox-custom"></span>
                                {option}
                            </label>
                        ))}

                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </div>
                );

            case 'file':
                return (
                    <div className="file-upload">
                        <input
                            type="file"
                            id={name}
                            name={name}
                            multiple={multiple}
                            required={required}
                            onChange={onChange}
                        />
                        <label htmlFor={name} className="file-label">
                            {placeholder || "Choisir un fichier"}
                        </label>

                        {errors[name] && (
                            <span className="error-message">{errors[name]}</span>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`Input-field ${type}-field ${required ? 'required' : ''}`}>
            {label && (
                <label htmlFor={name}>
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}
            {renderField()}
        </div>
    );
};