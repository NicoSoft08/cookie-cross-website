import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { schemaService } from '../services/form-schema';
import { brandService } from '../services/brand';

const DynamicForm = ({ slug }) => {
    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chargement de la configuration depuis le serveur
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await schemaService.getFormFieldsBySlug(slug);
            if (res.success) {
                const { slug, fields } = res.fields
                console.log(slug);
                setFields(fields);
                setLoading(false);

                const brands = await brandService.getBrandBySlug(slug);
                if (brands.success && brands.data) {
                    setBrands(brands.data);
                }
            }
        }

        fetchData();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div>Chargement du formulaire...</div>;
    if (!slug) return <div>Formulaire non trouvé</div>;

    return (
        <form className="vehicle-form">
            {fields.map((field) => {
                switch (field.type) {
                    case 'text':
                        return (
                            <div key={field.name} className="form-group">
                                <label>{field.label}</label>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                />
                            </div>
                        );

                    case 'select':
                        const options = field.name === 'brand'
                            ? brands
                            : field.options || [];

                        return (
                            <div key={field.name} className="form-group">
                                <label>{field.label}</label>
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                >
                                    <option value="">{field.placeholder}</option>
                                    {options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.icon && (
                                                <img
                                                    src={option.icon}
                                                    alt={option.label}
                                                    className="brand-icon"
                                                />
                                            )}
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );

                    default:
                        return null;
                }
            })}
            <button type="submit">Soumettre</button>
        </form>
    );
};

export default DynamicForm;