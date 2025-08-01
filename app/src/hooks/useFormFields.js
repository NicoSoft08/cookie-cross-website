import { useEffect, useState } from "react";
import { categoryService } from "../services/categories";

export const useFormFields = () => {
    const [formFields, setFormFields] = useState({ fields: {} });
    const [categories, setCategories] = useState([]);
    const [sensitiveCategories, setSensitiveCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [catsResult, sensCatsResult, fieldsResult] = await Promise.all([
                categoryService.getCategories(),
                categoryService.getSensitiveCategories(),
                categoryService.getFormFields()
            ]);

            setCategories(catsResult.data || []);
            setSensitiveCategories(sensCatsResult.data?.sensitive_cats || []);
            setFormFields(fieldsResult || { fields: {} });

        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldsForSubcategory = (subcategory) => {
        return formFields.fields?.[subcategory] || [];
    };

    const validateRequiredFields = (subcategory, details) => {
        const fields = getFieldsForSubcategory(subcategory);
        const requiredFields = fields.filter(field => field.required);

        const missingFields = requiredFields.filter(field => {
            const value = details?.[field.name];
            return !value || (Array.isArray(value) && value.length === 0);
        });

        return {
            isValid: missingFields.length === 0,
            missingFields: missingFields.map(field => field.label)
        };
    };

    return {
        formFields,
        categories,
        sensitiveCategories,
        isLoading,
        error,
        getFieldsForSubcategory,
        validateRequiredFields,
        reload: loadData
    };
}