const path = require('path');
const fs = require('fs').promises;

class CategoryService {
    /**
   * Charger les catégories depuis le fichier JSON
   */
    static async loadCategories() {
        try {
            const categoriesPath = path.join(__dirname, '../data/categories.json');
            const sensitiveCategoriesPath = path.join(__dirname, '../data/sensitive-categories.json');
            const catData = await fs.readFile(categoriesPath, 'utf8');
            const sensitiveCatData = await fs.readFile(sensitiveCategoriesPath, 'utf8');
            const categories = JSON.parse(catData);
            const sensitiveCategories = JSON.parse(sensitiveCatData);
            return { categories, sensitiveCategories };
        } catch (error) {
            console.error('Erreur lors du chargement des catégories:', error);
            throw new Error('Impossible de charger les catégories');
        }
    }

    static async loadFormFields(subcategory) {
        try {
            const formFieldsPath = path.join(__dirname, '../data/form-fields.json');
            const formFieldsData = await fs.readFile(formFieldsPath, 'utf8');
            const parsed = JSON.parse(formFieldsData);

            // On récupère le champ correspondant à la sous-catégorie
            if (parsed.fields && parsed.fields[subcategory]) {
                return {
                    fields: parsed.fields[subcategory]
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des champs du formulaire:', error);
            throw new Error('Impossible de charger les champs du formulaire');
        }
    }
};


module.exports = CategoryService;